-- ===================================
-- BASE DE DATOS MINDTRACK (Supabase / PostgreSQL)
-- Proyecto ADSO - SENA
-- ===================================
--
-- Adaptación del modelo original (MySQL) a Supabase:
--   * Las cuentas y contraseñas las gestiona Supabase Auth (auth.users).
--     La tabla usuarios guarda solo el perfil y se crea sola al registrarse.
--   * Los ENUM de MySQL pasan a tipos ENUM de PostgreSQL.
--   * AUTO_INCREMENT pasa a columnas GENERATED ALWAYS AS IDENTITY.
--   * Todas las tablas tienen Row Level Security (RLS).
--   * Borrar una cuenta borra su perfil, pero no citas, historial, estados de
--     ánimo ni pagos: una cuenta con esos registros se desactiva (estado = false).

-- -----------------------------------
-- TIPOS
-- -----------------------------------

create type public.rol_usuario as enum ('Administrador', 'Doctor', 'Paciente');
create type public.genero as enum ('Masculino', 'Femenino', 'Otro');
create type public.estado_cita as enum ('Pendiente', 'Confirmada', 'Finalizada', 'Cancelada');
create type public.estado_animo as enum ('Muy Feliz', 'Feliz', 'Neutral', 'Triste', 'Muy Triste');
create type public.metodo_pago as enum ('Efectivo', 'Tarjeta', 'Transferencia', 'Nequi');
create type public.estado_pago as enum ('Pendiente', 'Pagado');

-- -----------------------------------
-- TABLAS
-- -----------------------------------

-- Perfil de cada cuenta de Supabase Auth (sin contraseña).
create table public.usuarios (
  id_usuario uuid primary key references auth.users (id) on delete cascade,
  nombre varchar(80) not null,
  apellido varchar(80) not null,
  correo varchar(120) not null unique,
  rol public.rol_usuario not null default 'Paciente',
  telefono varchar(20),
  estado boolean not null default true
);

create table public.especialidades (
  id_especialidad int generated always as identity primary key,
  nombre varchar(80) not null unique
);

create table public.doctores (
  id_doctor int generated always as identity primary key,
  id_usuario uuid not null unique references public.usuarios (id_usuario) on delete cascade,
  id_especialidad int not null references public.especialidades (id_especialidad),
  licencia varchar(50) unique
);

create table public.pacientes (
  id_paciente int generated always as identity primary key,
  id_usuario uuid not null unique references public.usuarios (id_usuario) on delete cascade,
  fecha_nacimiento date,
  genero public.genero
);

create table public.servicios (
  id_servicio int generated always as identity primary key,
  nombre varchar(100) not null unique,
  valor numeric(10, 2) not null check (valor >= 0)
);

create table public.citas (
  id_cita int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  id_doctor int not null references public.doctores (id_doctor),
  id_servicio int not null references public.servicios (id_servicio),
  fecha date not null,
  hora time not null,
  estado public.estado_cita not null default 'Pendiente'
);

-- Un doctor no puede tener dos citas activas a la misma hora.
create unique index citas_horario_doctor_unico
  on public.citas (id_doctor, fecha, hora)
  where estado <> 'Cancelada';

create table public.historial_clinico (
  id_historial int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  id_doctor int not null references public.doctores (id_doctor),
  diagnostico text,
  tratamiento text,
  observaciones text,
  fecha date not null default current_date
);

create table public.estados_animo (
  id_estado int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  estado public.estado_animo not null,
  comentario text,
  fecha timestamptz not null default now()
);

create table public.pagos (
  id_pago int generated always as identity primary key,
  id_cita int not null references public.citas (id_cita),
  valor numeric(10, 2) not null check (valor >= 0),
  metodo public.metodo_pago not null,
  estado public.estado_pago not null default 'Pendiente'
);

-- Índices para las llaves foráneas que no tienen uno propio.
create index on public.doctores (id_especialidad);
create index on public.citas (id_paciente);
create index on public.citas (id_doctor);
create index on public.citas (id_servicio);
create index on public.historial_clinico (id_paciente);
create index on public.historial_clinico (id_doctor);
create index on public.estados_animo (id_paciente);
create index on public.pagos (id_cita);

-- -----------------------------------
-- FUNCIONES DE APOYO PARA RLS
-- -----------------------------------
-- Viven en el esquema "private", que la API de Supabase no publica.
-- Son SECURITY DEFINER para consultar las tablas sin volver a aplicar RLS
-- (así las políticas no se llaman entre sí en bucle).

create schema private;
grant usage on schema private to authenticated;

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
    if new.id_usuario is distinct from old.id_usuario or new.correo is distinct from old.correo then
      raise exception 'El correo se cambia con Supabase Auth (supabase.auth.updateUser)';
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

-- -----------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------
-- Las políticas son solo para el rol "authenticated": sin sesión no se ve nada.
-- El historial clínico y los estados de ánimo los ven solo el paciente y sus
-- doctores; el administrador no tiene acceso a esa información clínica.

alter table public.usuarios enable row level security;
alter table public.especialidades enable row level security;
alter table public.doctores enable row level security;
alter table public.pacientes enable row level security;
alter table public.servicios enable row level security;
alter table public.citas enable row level security;
alter table public.historial_clinico enable row level security;
alter table public.estados_animo enable row level security;
alter table public.pagos enable row level security;

-- usuarios ---------------------------

create policy "usuarios: consultar" on public.usuarios
  for select to authenticated
  using (
    id_usuario = (select auth.uid())                                       -- su propio perfil
    or (select private.es_admin())
    or exists (select 1 from public.doctores d                             -- perfiles de los doctores
               where d.id_usuario = usuarios.id_usuario)
    or exists (select 1 from public.pacientes p                            -- pacientes del doctor
               where p.id_usuario = usuarios.id_usuario
                 and private.atiende_paciente(p.id_paciente))
  );

create policy "usuarios: actualizar" on public.usuarios
  for update to authenticated
  using (id_usuario = (select auth.uid()) or (select private.es_admin()))
  with check (id_usuario = (select auth.uid()) or (select private.es_admin()));

-- especialidades ---------------------

create policy "especialidades: consultar" on public.especialidades
  for select to authenticated using (true);

create policy "especialidades: crear (admin)" on public.especialidades
  for insert to authenticated with check ((select private.es_admin()));

create policy "especialidades: actualizar (admin)" on public.especialidades
  for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));

create policy "especialidades: eliminar (admin)" on public.especialidades
  for delete to authenticated using ((select private.es_admin()));

-- doctores ---------------------------

create policy "doctores: consultar" on public.doctores
  for select to authenticated using (true);

create policy "doctores: crear (admin)" on public.doctores
  for insert to authenticated with check ((select private.es_admin()));

create policy "doctores: actualizar (admin)" on public.doctores
  for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));

create policy "doctores: eliminar (admin)" on public.doctores
  for delete to authenticated using ((select private.es_admin()));

-- pacientes --------------------------

create policy "pacientes: consultar" on public.pacientes
  for select to authenticated
  using (
    id_usuario = (select auth.uid())
    or (select private.es_admin())
    or private.atiende_paciente(id_paciente)
  );

create policy "pacientes: crear (admin)" on public.pacientes
  for insert to authenticated with check ((select private.es_admin()));

create policy "pacientes: actualizar" on public.pacientes
  for update to authenticated
  using (id_usuario = (select auth.uid()) or (select private.es_admin()))
  with check (id_usuario = (select auth.uid()) or (select private.es_admin()));

create policy "pacientes: eliminar (admin)" on public.pacientes
  for delete to authenticated using ((select private.es_admin()));

-- servicios --------------------------

create policy "servicios: consultar" on public.servicios
  for select to authenticated using (true);

create policy "servicios: crear (admin)" on public.servicios
  for insert to authenticated with check ((select private.es_admin()));

create policy "servicios: actualizar (admin)" on public.servicios
  for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));

create policy "servicios: eliminar (admin)" on public.servicios
  for delete to authenticated using ((select private.es_admin()));

-- citas ------------------------------

create policy "citas: consultar" on public.citas
  for select to authenticated
  using (
    id_paciente = (select private.mi_id_paciente())
    or id_doctor = (select private.mi_id_doctor())
    or (select private.es_admin())
  );

-- El paciente agenda sus propias citas, siempre en estado Pendiente.
create policy "citas: crear" on public.citas
  for insert to authenticated
  with check (
    (id_paciente = (select private.mi_id_paciente()) and estado = 'Pendiente')
    or (select private.es_admin())
  );

-- El paciente puede cambiar o cancelar una cita mientras está Pendiente;
-- el doctor gestiona las suyas (confirmar, finalizar, cancelar).
create policy "citas: actualizar" on public.citas
  for update to authenticated
  using (
    (id_paciente = (select private.mi_id_paciente()) and estado = 'Pendiente')
    or id_doctor = (select private.mi_id_doctor())
    or (select private.es_admin())
  )
  with check (
    (id_paciente = (select private.mi_id_paciente()) and estado in ('Pendiente', 'Cancelada'))
    or id_doctor = (select private.mi_id_doctor())
    or (select private.es_admin())
  );

create policy "citas: eliminar (admin)" on public.citas
  for delete to authenticated using ((select private.es_admin()));

-- El paciente de una cita no se cambia desde la app (evita que un doctor
-- se asigne a sí mismo pacientes ajenos editando una de sus citas).
revoke update on public.citas from anon, authenticated;
grant update (id_doctor, id_servicio, fecha, hora, estado) on public.citas to authenticated;

-- historial_clinico ------------------

create policy "historial: consultar" on public.historial_clinico
  for select to authenticated
  using (
    id_paciente = (select private.mi_id_paciente())
    or private.atiende_paciente(id_paciente)
  );

create policy "historial: crear (doctor)" on public.historial_clinico
  for insert to authenticated
  with check (
    id_doctor = (select private.mi_id_doctor())
    and private.atiende_paciente(id_paciente)
  );

create policy "historial: actualizar (doctor)" on public.historial_clinico
  for update to authenticated
  using (id_doctor = (select private.mi_id_doctor()))
  with check (
    id_doctor = (select private.mi_id_doctor())
    and private.atiende_paciente(id_paciente)
  );

-- estados_animo ----------------------

create policy "estados_animo: consultar" on public.estados_animo
  for select to authenticated
  using (
    id_paciente = (select private.mi_id_paciente())
    or private.atiende_paciente(id_paciente)
  );

create policy "estados_animo: crear (paciente)" on public.estados_animo
  for insert to authenticated
  with check (id_paciente = (select private.mi_id_paciente()));

create policy "estados_animo: actualizar (paciente)" on public.estados_animo
  for update to authenticated
  using (id_paciente = (select private.mi_id_paciente()))
  with check (id_paciente = (select private.mi_id_paciente()));

create policy "estados_animo: eliminar (paciente)" on public.estados_animo
  for delete to authenticated
  using (id_paciente = (select private.mi_id_paciente()));

-- pagos ------------------------------

create policy "pagos: consultar" on public.pagos
  for select to authenticated
  using (
    (select private.es_admin())
    or exists (select 1 from public.citas c
               where c.id_cita = pagos.id_cita
                 and c.id_paciente = (select private.mi_id_paciente()))
  );

create policy "pagos: crear (admin)" on public.pagos
  for insert to authenticated with check ((select private.es_admin()));

create policy "pagos: actualizar (admin)" on public.pagos
  for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));

create policy "pagos: eliminar (admin)" on public.pagos
  for delete to authenticated using ((select private.es_admin()));
