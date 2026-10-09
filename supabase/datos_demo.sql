-- ===================================
-- DATOS DE DEMOSTRACIÓN
-- ===================================
-- Reproduce los datos de ejemplo del modelo original. Ejecutar una sola vez
-- en el SQL Editor de Supabase, después de:
--   1. Aplicar la migración y seed.sql.
--   2. Crear estas tres cuentas en Authentication → Users → Add user
--      (marcar "Auto Confirm User"; la contraseña se define allí, no aquí):
--        admin@mindtrack.com, laura@mindtrack.com, juan@mindtrack.com
--      Cada cuenta crea su perfil en usuarios como Paciente; este script
--      completa los datos y asigna los roles.

do $$
declare
  v_admin uuid;
  v_laura uuid;
  v_juan uuid;
  v_paciente int;
  v_doctor int;
  v_cita int;
begin
  select id_usuario into v_admin from public.usuarios where correo = 'admin@mindtrack.com';
  select id_usuario into v_laura from public.usuarios where correo = 'laura@mindtrack.com';
  select id_usuario into v_juan from public.usuarios where correo = 'juan@mindtrack.com';

  if v_admin is null or v_laura is null or v_juan is null then
    raise exception 'Primero crea las tres cuentas de demostración en Authentication → Users';
  end if;

  -- Perfiles y roles
  update public.usuarios
  set nombre = 'Admin', apellido = 'Sistema', telefono = '3000000000', rol = 'Administrador'
  where id_usuario = v_admin;

  update public.usuarios
  set nombre = 'Laura', apellido = 'Gomez', telefono = '3001111111', rol = 'Doctor'
  where id_usuario = v_laura;

  update public.usuarios
  set nombre = 'Juan', apellido = 'Perez', telefono = '3002222222', rol = 'Paciente'
  where id_usuario = v_juan;

  -- El administrador y la doctora no son pacientes
  delete from public.pacientes where id_usuario in (v_admin, v_laura);

  insert into public.doctores (id_usuario, id_especialidad, licencia)
  values (
    v_laura,
    (select id_especialidad from public.especialidades where nombre = 'Psicología Clínica'),
    'LIC-1001'
  )
  returning id_doctor into v_doctor;

  update public.pacientes
  set fecha_nacimiento = '2002-05-10', genero = 'Masculino'
  where id_usuario = v_juan
  returning id_paciente into v_paciente;

  -- Cita, historial, estado de ánimo y pago
  insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora, estado)
  values (
    v_paciente,
    v_doctor,
    (select id_servicio from public.servicios where nombre = 'Consulta Psicológica'),
    '2026-08-01',
    '09:00',
    'Confirmada'
  )
  returning id_cita into v_cita;

  insert into public.historial_clinico (id_paciente, id_doctor, diagnostico, tratamiento, observaciones, fecha)
  values (v_paciente, v_doctor, 'Ansiedad leve', 'Terapia cognitivo-conductual', 'Buena evolución', '2026-08-01');

  insert into public.estados_animo (id_paciente, estado, comentario)
  values (v_paciente, 'Feliz', 'Me siento mejor.');

  insert into public.pagos (id_cita, valor, metodo, estado)
  values (v_cita, 90000, 'Nequi', 'Pagado');
end;
$$;

-- -----------------------------------
-- CONSULTAS DE COMPROBACIÓN
-- -----------------------------------
-- En el SQL Editor se ven todos los registros. Desde la app, RLS limita
-- cada consulta a lo que el usuario autenticado puede ver.

select * from public.usuarios;
select * from public.pacientes;
select * from public.doctores;

-- Citas con el nombre del paciente y el servicio
select u.nombre, u.apellido, c.fecha, c.hora, s.nombre as servicio
from public.citas c
join public.pacientes p on c.id_paciente = p.id_paciente
join public.usuarios u on p.id_usuario = u.id_usuario
join public.servicios s on c.id_servicio = s.id_servicio;

-- Citas por estado
select estado, count(*) as total
from public.citas
group by estado;

-- Total recaudado por método de pago
select metodo, sum(valor) as total_recaudado
from public.pagos
group by metodo;

-- Estados de ánimo recientes
select ea.estado, ea.fecha, u.nombre
from public.estados_animo ea
join public.pacientes p on ea.id_paciente = p.id_paciente
join public.usuarios u on p.id_usuario = u.id_usuario
order by ea.fecha desc;
