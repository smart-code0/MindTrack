-- ===================================
-- REVERTIR EL ESQUEMA INICIAL DE MINDTRACK
-- ===================================
-- BORRA todas las tablas de MindTrack y sus datos. Las cuentas de Supabase
-- Auth (auth.users) no se tocan.
--
-- Usar solo en un proyecto sin datos reales, o después de un respaldo
-- verificado (supabase db dump). Todo ocurre en una transacción: si algo
-- falla, no se borra nada.

begin;

-- En Supabase, auth.users pertenece a supabase_auth_admin y postgres no puede
-- usar DROP TRIGGER sobre ella. Los triggers se borran al borrar sus funciones
-- (esquema private) con CASCADE, como indica la documentación de Supabase.
drop schema if exists private cascade;

drop table if exists
  public.pagos, public.estados_animo, public.historial_clinico, public.actividades,
  public.citas, public.servicios, public.pacientes, public.doctores,
  public.especialidades, public.usuarios;

drop type if exists
  public.tipo_actividad, public.estrategia_afrontamiento, public.emocion,
  public.estado_pago, public.metodo_pago, public.estado_animo,
  public.estado_cita, public.genero, public.rol_usuario;

-- Historial de migraciones de Supabase, para poder aplicarlas de nuevo.
do $$
begin
  if to_regclass('supabase_migrations.schema_migrations') is not null then
    delete from supabase_migrations.schema_migrations
    where name in ('tipos_y_tablas', 'funciones_y_triggers', 'seguridad_rls');
  end if;
end;
$$;

commit;
