-- ===================================
-- DATOS INICIALES (catálogos)
-- ===================================
-- Se puede ejecutar varias veces sin duplicar registros.

insert into public.especialidades (nombre) values
  ('Psicología Clínica'),
  ('Psicología Infantil')
on conflict (nombre) do nothing;

insert into public.servicios (nombre, valor) values
  ('Consulta Psicológica', 90000),
  ('Terapia Individual', 120000)
on conflict (nombre) do nothing;
