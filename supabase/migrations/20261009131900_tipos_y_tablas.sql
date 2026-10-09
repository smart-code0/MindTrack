-- ===================================
-- BASE DE DATOS MINDTRACK (Supabase / PostgreSQL)
-- Proyecto ADSO - SENA
-- 1/3: tipos, tablas, restricciones e índices
-- ===================================
--
-- Adaptación del modelo original (MySQL) a Supabase:
--   * Las cuentas y contraseñas las gestiona Supabase Auth (auth.users).
--     La tabla usuarios guarda solo el perfil y se crea sola al registrarse.
--   * Los ENUM de MySQL pasan a tipos ENUM de PostgreSQL.
--   * AUTO_INCREMENT pasa a columnas GENERATED ALWAYS AS IDENTITY.
--   * Borrar una cuenta borra su perfil, pero no citas, historial, estados de
--     ánimo ni pagos: una cuenta con esos registros se desactiva (estado = false).
--   * Las fechas de día del registro diario usan la hora de Colombia.

-- -----------------------------------
-- TIPOS
-- -----------------------------------

create type public.rol_usuario as enum ('Administrador', 'Doctor', 'Paciente');
create type public.genero as enum ('Masculino', 'Femenino', 'Otro');
create type public.estado_cita as enum ('Pendiente', 'Confirmada', 'Finalizada', 'Cancelada');
create type public.estado_animo as enum ('Muy Feliz', 'Feliz', 'Neutral', 'Triste', 'Muy Triste');
create type public.metodo_pago as enum ('Efectivo', 'Tarjeta', 'Transferencia', 'Nequi');
create type public.estado_pago as enum ('Pendiente', 'Pagado');

-- Opciones del registro diario de la app (pasos 1 y 4).
create type public.emocion as enum (
  'Calma', 'Motivación', 'Cansancio', 'Enojo', 'Soledad',
  'Esperanza', 'Nervios', 'Estrés', 'Agobio'
);
create type public.estrategia_afrontamiento as enum (
  'Aire libre', 'Descanso', 'Medicación', 'Meditación', 'Ejercicio',
  'Conversar', 'Terapia', 'Escribir', 'Música', 'Familia'
);

-- Actividades de la agenda personal que no son citas con un doctor.
create type public.tipo_actividad as enum ('Ejercicio', 'Seguimiento', 'Otro');

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
  estado boolean not null default true,
  creado_en timestamptz not null default now()
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

-- Sesiones con un doctor registrado. El tipo de cita (psicólogo, psiquiatra,
-- médico) sale de la especialidad del doctor.
create table public.citas (
  id_cita int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  id_doctor int not null references public.doctores (id_doctor),
  id_servicio int not null references public.servicios (id_servicio),
  fecha date not null,
  hora time not null,
  estado public.estado_cita not null default 'Pendiente',
  lugar varchar(120),
  recordatorio boolean not null default true
);

-- Un doctor no puede tener dos citas activas a la misma hora.
create unique index citas_horario_doctor_unico
  on public.citas (id_doctor, fecha, hora)
  where estado <> 'Cancelada';

-- Agenda personal del paciente. Se borra con la cuenta porque no es un
-- registro clínico.
create table public.actividades (
  id_actividad int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente) on delete cascade,
  tipo public.tipo_actividad not null,
  fecha date not null,
  hora time not null,
  lugar varchar(120),
  recordatorio boolean not null default true
);

create table public.historial_clinico (
  id_historial int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  id_doctor int not null references public.doctores (id_doctor),
  diagnostico text,
  tratamiento text,
  observaciones text,
  fecha date not null default current_date
);

-- Registro diario: el ánimo del día (pantalla Inicio) y el registro completo
-- de 5 pasos guardan en la misma fila. Un registro por paciente y por día.
-- Las escalas de estrés, sueño, energía y apetito van de 0 a 100, como los
-- deslizadores de la app; afrontamiento vacío ('{}') significa "None of these".
create table public.estados_animo (
  id_estado int generated always as identity primary key,
  id_paciente int not null references public.pacientes (id_paciente),
  dia date not null default (now() at time zone 'America/Bogota')::date,
  estado public.estado_animo,
  emociones public.emocion[] check (array_position(emociones, null) is null),
  estres smallint check (estres between 0 and 100),
  calidad_sueno smallint check (calidad_sueno between 0 and 100),
  energia smallint check (energia between 0 and 100),
  apetito smallint check (apetito between 0 and 100),
  comentario text check (char_length(comentario) <= 300),
  afrontamiento public.estrategia_afrontamiento[] check (array_position(afrontamiento, null) is null),
  orgullo varchar(100),
  fecha timestamptz not null default now(),
  unique (id_paciente, dia),
  constraint estados_animo_no_vacio check (
    num_nonnulls(estado, emociones, estres, calidad_sueno, energia, apetito,
                 comentario, afrontamiento, orgullo) > 0
  )
);

create table public.pagos (
  id_pago int generated always as identity primary key,
  id_cita int not null references public.citas (id_cita),
  valor numeric(10, 2) not null check (valor >= 0),
  metodo public.metodo_pago not null,
  estado public.estado_pago not null default 'Pendiente'
);

-- Índices para las llaves foráneas y las consultas de la app (agenda por
-- fecha, historial por fecha). doctores.id_usuario, pacientes.id_usuario y
-- estados_animo (id_paciente, dia) ya tienen índice por su restricción UNIQUE.
create index on public.doctores (id_especialidad);
create index on public.citas (id_paciente, fecha);
create index on public.citas (id_doctor, fecha);
create index on public.citas (id_servicio);
create index on public.actividades (id_paciente, fecha);
create index on public.historial_clinico (id_paciente, fecha);
create index on public.historial_clinico (id_doctor);
create index on public.pagos (id_cita);
