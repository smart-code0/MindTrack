-- ===================================
-- VALIDACIÓN DEL ESQUEMA
-- ===================================
-- Solo lectura. Ejecutar en el SQL Editor después de aplicar las migraciones
-- y seed.sql. Cada fila es una comprobación; todas deben tener ok = true.

with
tablas(nombre) as (
  values ('usuarios'), ('especialidades'), ('doctores'), ('pacientes'), ('servicios'),
         ('citas'), ('actividades'), ('historial_clinico'), ('estados_animo'), ('pagos')
),
info as (
  select t.nombre, c.oid, c.relrowsecurity as rls
  from tablas t
  left join pg_class c on c.relname = t.nombre and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
),
fks as (
  select con.conrelid, con.conkey[1] as col, con.conname
  from pg_constraint con
  where con.contype = 'f' and con.conrelid in (select oid from info)
)
select '1. Existen las 10 tablas' as comprobacion,
       (select count(oid) from info)::text as resultado,
       (select count(oid) from info) = 10 as ok
union all
select '2. RLS activo en todas',
       (select count(*) from info where rls)::text,
       (select count(*) from info where rls) = 10
union all
select '3. Todas las tablas tienen políticas',
       (select count(distinct tablename) from pg_policies where schemaname = 'public'
          and tablename in (select nombre from tablas))::text,
       (select count(distinct tablename) from pg_policies where schemaname = 'public'
          and tablename in (select nombre from tablas)) = 10
union all
select '4. Ninguna política de escritura usa "true"',
       (select count(*) from pg_policies where schemaname = 'public' and cmd <> 'SELECT'
          and (qual = 'true' or with_check = 'true'))::text,
       (select count(*) from pg_policies where schemaname = 'public' and cmd <> 'SELECT'
          and (qual = 'true' or with_check = 'true')) = 0
union all
select '5. anon no tiene privilegios sobre las tablas',
       (select count(*) from information_schema.role_table_grants
          where grantee = 'anon' and table_schema = 'public'
            and table_name in (select nombre from tablas))::text,
       (select count(*) from information_schema.role_table_grants
          where grantee = 'anon' and table_schema = 'public'
            and table_name in (select nombre from tablas)) = 0
union all
select '6. authenticated no puede hacer TRUNCATE',
       (select count(*) from information_schema.role_table_grants
          where grantee = 'authenticated' and table_schema = 'public' and privilege_type = 'TRUNCATE'
            and table_name in (select nombre from tablas))::text,
       (select count(*) from information_schema.role_table_grants
          where grantee = 'authenticated' and table_schema = 'public' and privilege_type = 'TRUNCATE'
            and table_name in (select nombre from tablas)) = 0
union all
select '7. Existen las 12 llaves foráneas',
       (select count(*) from fks)::text,
       (select count(*) from fks) = 12
union all
select '8. Toda llave foránea tiene índice',
       coalesce((select string_agg(conname, ', ') from fks
          where not exists (select 1 from pg_index i
                            where i.indrelid = fks.conrelid and i.indkey[0] = fks.col)), 'todas'),
       not exists (select 1 from fks
          where not exists (select 1 from pg_index i
                            where i.indrelid = fks.conrelid and i.indkey[0] = fks.col))
union all
select '9. Triggers de Supabase Auth instalados',
       (select string_agg(tgname, ', ' order by tgname) from pg_trigger
          where tgrelid = 'auth.users'::regclass and tgname in ('al_crear_usuario_auth', 'al_cambiar_correo_auth')),
       (select count(*) from pg_trigger
          where tgrelid = 'auth.users'::regclass and tgname in ('al_crear_usuario_auth', 'al_cambiar_correo_auth')) = 2
union all
select '10. Funciones de private con search_path fijo',
       (select count(*) from pg_proc where pronamespace = 'private'::regnamespace and proconfig is null)::text || ' sin fijar',
       not exists (select 1 from pg_proc where pronamespace = 'private'::regnamespace and proconfig is null)
union all
select '11. Catálogos cargados (seed.sql)',
       (select count(*) from public.especialidades)::text || ' especialidades, '
         || (select count(*) from public.servicios)::text || ' servicios',
       (select count(*) from public.especialidades) >= 4 and (select count(*) from public.servicios) >= 2
union all
select '12. Cada cuenta de Auth tiene perfil',
       (select count(*) from auth.users au
          where not exists (select 1 from public.usuarios u where u.id_usuario = au.id))::text || ' sin perfil',
       not exists (select 1 from auth.users au
          where not exists (select 1 from public.usuarios u where u.id_usuario = au.id))
union all
select '13. Fichas coherentes con el rol',
       (select count(*) from public.doctores d join public.usuarios u using (id_usuario) where u.rol <> 'Doctor')::text
         || ' doctores y '
         || (select count(*) from public.pacientes p join public.usuarios u using (id_usuario) where u.rol <> 'Paciente')::text
         || ' pacientes con otro rol',
       not exists (select 1 from public.doctores d join public.usuarios u using (id_usuario) where u.rol <> 'Doctor')
       and not exists (select 1 from public.pacientes p join public.usuarios u using (id_usuario) where u.rol <> 'Paciente');
