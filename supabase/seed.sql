-- ===================================
-- DATOS INICIALES (catálogos)
-- ===================================
-- Se puede ejecutar varias veces sin duplicar registros.
-- Psiquiatría y Medicina General corresponden a los tipos de cita
-- "Psychiatrist" y "Doctor" de la app; los demás vienen del modelo original.

insert into public.especialidades (nombre) values
  ('Psicología Clínica'),
  ('Psicología Infantil'),
  ('Psiquiatría'),
  ('Medicina General')
on conflict (nombre) do nothing;

insert into public.servicios (nombre, valor) values
  ('Consulta Psicológica', 90000),
  ('Terapia Individual', 120000)
on conflict (nombre) do nothing;
