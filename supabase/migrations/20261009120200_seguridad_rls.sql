-- ===================================
-- BASE DE DATOS MINDTRACK
-- 3/3: privilegios y Row Level Security
-- ===================================
-- Las políticas son solo para el rol "authenticated": sin sesión no se ve nada.
-- El historial clínico y los estados de ánimo los ven solo el paciente y sus
-- doctores; el administrador no tiene acceso a esa información clínica.
-- La agenda personal (actividades) solo la ve su paciente.

-- -----------------------------------
-- PRIVILEGIOS MÍNIMOS
-- -----------------------------------
-- Supabase concede por defecto todos los privilegios de las tablas nuevas a
-- anon y authenticated. Se quitan y se conceden solo los que usan las
-- políticas de abajo (sin TRUNCATE, que RLS no controla).

grant usage on schema private to authenticated;

revoke all on
  public.usuarios, public.especialidades, public.doctores, public.pacientes,
  public.servicios, public.citas, public.actividades, public.historial_clinico,
  public.estados_animo, public.pagos
from anon, authenticated;

grant select, update on public.usuarios to authenticated;
grant select, insert, update, delete on
  public.especialidades, public.doctores, public.pacientes, public.servicios,
  public.actividades, public.estados_animo, public.pagos
to authenticated;
grant select, insert on public.historial_clinico to authenticated;
grant update (diagnostico, tratamiento, observaciones, fecha) on public.historial_clinico to authenticated;
-- El paciente de una cita no se cambia desde la app (evita que un doctor se
-- asigne pacientes ajenos editando una de sus citas).
grant select, insert, delete on public.citas to authenticated;
grant update (id_doctor, id_servicio, fecha, hora, estado, lugar, recordatorio) on public.citas to authenticated;

-- -----------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------

alter table public.usuarios enable row level security;
alter table public.especialidades enable row level security;
alter table public.doctores enable row level security;
alter table public.pacientes enable row level security;
alter table public.servicios enable row level security;
alter table public.citas enable row level security;
alter table public.actividades enable row level security;
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

-- actividades ------------------------

create policy "actividades: consultar (paciente)" on public.actividades
  for select to authenticated
  using (id_paciente = (select private.mi_id_paciente()));

create policy "actividades: crear (paciente)" on public.actividades
  for insert to authenticated
  with check (id_paciente = (select private.mi_id_paciente()));

create policy "actividades: actualizar (paciente)" on public.actividades
  for update to authenticated
  using (id_paciente = (select private.mi_id_paciente()))
  with check (id_paciente = (select private.mi_id_paciente()));

create policy "actividades: eliminar (paciente)" on public.actividades
  for delete to authenticated
  using (id_paciente = (select private.mi_id_paciente()));

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
