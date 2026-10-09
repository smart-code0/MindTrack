-- ===================================
-- BASE DE DATOS MINDTRACK
-- 2/3: funciones de apoyo y triggers
-- ===================================

-- -----------------------------------
-- FUNCIONES DE APOYO PARA RLS
-- -----------------------------------
-- Viven en el esquema "private", que la API de Supabase no publica.
-- Son SECURITY DEFINER para consultar las tablas sin volver a aplicar RLS
-- (así las políticas no se llaman entre sí en bucle).

create schema private;

-- ¿El usuario actual es un administrador activo?
create function private.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id_usuario = (select auth.uid()) and rol = 'Administrador' and estado
  );
$$;

-- id_paciente del usuario actual (null si no es paciente).
create function private.mi_id_paciente()
returns int
language sql stable security definer set search_path = ''
as $$
  select id_paciente from public.pacientes where id_usuario = (select auth.uid());
$$;

-- id_doctor del usuario actual (null si no es doctor registrado y activo).
-- Elegir "Doctor" al registrarse no basta: un administrador debe crear su
-- fila en doctores (especialidad y licencia) para darle acceso a pacientes.
create function private.mi_id_doctor()
returns int
language sql stable security definer set search_path = ''
as $$
  select d.id_doctor
  from public.doctores d
  join public.usuarios u on u.id_usuario = d.id_usuario
  where d.id_usuario = (select auth.uid()) and u.estado;
$$;

-- ¿El doctor actual tiene (o tuvo) una cita no cancelada con el paciente?
create function private.atiende_paciente(p_id_paciente int)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.citas
    where id_paciente = p_id_paciente
      and id_doctor = (select private.mi_id_doctor())
      and estado <> 'Cancelada'
  );
$$;

-- -----------------------------------
-- TRIGGERS
-- -----------------------------------

-- Al registrarse en Supabase Auth se crea el perfil en usuarios (y en pacientes
-- si corresponde). Datos opcionales en options.data de supabase.auth.signUp():
-- nombre, apellido, telefono y rol ('Paciente' o 'Doctor'). Nadie puede
-- registrarse como Administrador.
create function private.crear_perfil_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  datos jsonb := coalesce(new.raw_user_meta_data, '{}');
  nuevo_rol public.rol_usuario := case
    when datos ->> 'rol' = 'Doctor' then 'Doctor'::public.rol_usuario
    else 'Paciente'::public.rol_usuario
  end;
begin
  insert into public.usuarios (id_usuario, nombre, apellido, correo, rol, telefono)
  values (
    new.id,
    coalesce(datos ->> 'nombre', ''),
    coalesce(datos ->> 'apellido', ''),
    new.email,
    nuevo_rol,
    datos ->> 'telefono'
  );

  if nuevo_rol = 'Paciente' then
    insert into public.pacientes (id_usuario) values (new.id);
  end if;

  return new;
end;
$$;

create trigger al_crear_usuario_auth
  after insert on auth.users
  for each row execute function private.crear_perfil_usuario();

-- Cuentas creadas antes de esta migración (por ejemplo, desde el panel):
-- reciben su perfil con las mismas reglas del trigger.
insert into public.usuarios (id_usuario, nombre, apellido, correo, rol, telefono)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'nombre', ''),
  coalesce(au.raw_user_meta_data ->> 'apellido', ''),
  au.email,
  case when au.raw_user_meta_data ->> 'rol' = 'Doctor' then 'Doctor'::public.rol_usuario
       else 'Paciente'::public.rol_usuario end,
  au.raw_user_meta_data ->> 'telefono'
from auth.users au
where au.email is not null
on conflict (id_usuario) do nothing;

insert into public.pacientes (id_usuario)
select u.id_usuario from public.usuarios u
where u.rol = 'Paciente'
  and not exists (select 1 from public.pacientes p where p.id_usuario = u.id_usuario);

-- Mantiene usuarios.correo igual al correo de Supabase Auth.
create function private.actualizar_correo_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.usuarios set correo = new.email where id_usuario = new.id;
  return new;
end;
$$;

create trigger al_cambiar_correo_auth
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.actualizar_correo_usuario();

-- Desde la app, cada usuario edita su nombre, apellido y teléfono; solo un
-- administrador cambia el rol o el estado, y el correo se cambia únicamente con
-- Supabase Auth (el trigger anterior lo copia). Solo aplica a las peticiones
-- de la app (rol authenticated); el panel de Supabase no se restringe.
create function private.proteger_campos_usuario()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.id_usuario is distinct from old.id_usuario
       or new.correo is distinct from old.correo
       or new.creado_en is distinct from old.creado_en then
      raise exception 'El id, el correo y la fecha de creación no se cambian desde la app; el correo se cambia con supabase.auth.updateUser';
    end if;
    if not private.es_admin()
       and (new.rol is distinct from old.rol or new.estado is distinct from old.estado) then
      raise exception 'Solo un administrador puede cambiar el rol o el estado de un usuario';
    end if;
  end if;
  return new;
end;
$$;

create trigger proteger_campos_usuario
  before update on public.usuarios
  for each row execute function private.proteger_campos_usuario();

-- La ficha de doctor exige el rol Doctor y la de paciente, el rol Paciente,
-- para que el rol de usuarios y las fichas no se contradigan.
create function private.validar_rol_ficha()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  rol_esperado public.rol_usuario := case tg_table_name
    when 'doctores' then 'Doctor'::public.rol_usuario
    else 'Paciente'::public.rol_usuario
  end;
begin
  if not exists (
    select 1 from public.usuarios
    where id_usuario = new.id_usuario and rol = rol_esperado
  ) then
    raise exception 'El usuario debe tener el rol % para tener una ficha en %', rol_esperado, tg_table_name;
  end if;
  return new;
end;
$$;

create trigger validar_rol_doctor
  before insert or update of id_usuario on public.doctores
  for each row execute function private.validar_rol_ficha();

create trigger validar_rol_paciente
  before insert or update of id_usuario on public.pacientes
  for each row execute function private.validar_rol_ficha();
