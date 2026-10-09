-- ===================================
-- PRUEBAS DE PERMISOS (RLS)
-- ===================================
-- Crea cuentas de prueba (@mindtrack.test), hace operaciones permitidas y
-- prohibidas con cada rol y comprueba el resultado.
--
-- NO DEJA DATOS: al final lanza un error a propósito que deshace todo lo que
-- hizo. El mensaje del error es el resultado, por ejemplo:
--   ERROR: PRUEBAS MINDTRACK: 65 correctas, 0 fallidas
-- Si alguna falla, el mensaje lista cuáles.
--
-- Se ejecuta en el SQL Editor de Supabase (o con psql) después de aplicar
-- las migraciones y seed.sql.

do $$
declare
  correctas int := 0;
  fallidas text[] := '{}';
  u_admin uuid := gen_random_uuid();
  u_doc1 uuid := gen_random_uuid();   -- doctora que atiende al paciente 1
  u_doc2 uuid := gen_random_uuid();   -- doctor sin citas
  u_falso uuid := gen_random_uuid();  -- eligió Doctor al registrarse, sin aprobar
  u_pac1 uuid := gen_random_uuid();
  u_pac2 uuid := gen_random_uuid();
  u_hacker uuid := gen_random_uuid(); -- intentó registrarse como Administrador
  p1 int; p2 int; d1 int; d2 int; esp int; serv int; cita1 int; cita2 int;
  n int;
  ok boolean;
  hoy date := (now() at time zone 'America/Bogota')::date;
begin
  -- ---------- Registro (como lo hace Supabase Auth) ----------
  insert into auth.users (id, email, raw_user_meta_data) values
    (u_admin,  'admin@mindtrack.test',     '{"nombre":"Admin","apellido":"Prueba"}'),
    (u_doc1,   'doctora@mindtrack.test',   '{"nombre":"Laura","apellido":"Prueba","rol":"Doctor"}'),
    (u_doc2,   'doctor2@mindtrack.test',   '{"nombre":"Carlos","apellido":"Prueba","rol":"Doctor"}'),
    (u_falso,  'falso@mindtrack.test',     '{"nombre":"Falso","apellido":"Prueba","rol":"Doctor"}'),
    (u_pac1,   'paciente1@mindtrack.test', '{"nombre":"Juan","apellido":"Prueba"}'),
    (u_pac2,   'paciente2@mindtrack.test', '{"nombre":"Ana","apellido":"Prueba"}'),
    (u_hacker, 'hacker@mindtrack.test',    '{"nombre":"H","apellido":"X","rol":"Administrador"}');

  select id_paciente into p1 from public.pacientes where id_usuario = u_pac1;
  select id_paciente into p2 from public.pacientes where id_usuario = u_pac2;

  if (select rol from public.usuarios where id_usuario = u_hacker) = 'Paciente'
    then correctas := correctas + 1; else fallidas := fallidas || 'registro: nadie se registra como Administrador'::text; end if;
  if p1 is not null and (select nombre from public.usuarios where id_usuario = u_pac1) = 'Juan'
    then correctas := correctas + 1; else fallidas := fallidas || 'registro: crea perfil y ficha de paciente'::text; end if;
  if (select rol from public.usuarios where id_usuario = u_doc1) = 'Doctor'
     and not exists (select 1 from public.pacientes where id_usuario = u_doc1)
    then correctas := correctas + 1; else fallidas := fallidas || 'registro: un doctor no recibe ficha de paciente'::text; end if;

  -- El primer administrador se nombra desde el panel de Supabase.
  update public.usuarios set rol = 'Administrador' where id_usuario = u_admin;
  delete from public.pacientes where id_usuario = u_admin;

  -- ---------- Administrador ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.especialidades (nombre) values ('Especialidad de prueba') returning id_especialidad into esp;
  insert into public.servicios (nombre, valor) values ('Servicio de prueba', 1000) returning id_servicio into serv;
  insert into public.doctores (id_usuario, id_especialidad, licencia) values (u_doc1, esp, 'LIC-PRUEBA-1') returning id_doctor into d1;
  insert into public.doctores (id_usuario, id_especialidad, licencia) values (u_doc2, esp, 'LIC-PRUEBA-2') returning id_doctor into d2;
  correctas := correctas + 1;  -- admin gestiona catálogos y doctores

  begin
    insert into public.doctores (id_usuario, id_especialidad) values (u_pac2, esp);
    fallidas := fallidas || 'admin: no da ficha de doctor a un paciente'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;

  if (select count(*) from public.usuarios where correo like '%@mindtrack.test') = 7
    then correctas := correctas + 1; else fallidas := fallidas || 'admin: ve todos los usuarios'::text; end if;
  if (select count(*) from public.historial_clinico) = 0
     and (select count(*) from public.estados_animo) = 0
     and (select count(*) from public.actividades) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'admin: sin acceso a historial, estados de ánimo ni actividades'::text; end if;
  reset role;

  -- ---------- Paciente 1 ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_pac1, 'role', 'authenticated')::text, true);
  set local role authenticated;

  if (select count(*) from public.pacientes) = 1
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: ve solo su ficha'::text; end if;
  if (select array_agg(correo::text order by correo) from public.usuarios where correo like '%@mindtrack.test')
     = array['doctor2@mindtrack.test', 'doctora@mindtrack.test', 'paciente1@mindtrack.test']
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: ve su perfil y los de doctores registrados'::text; end if;

  update public.usuarios set nombre = 'Juanito' where id_usuario = u_pac1;
  if (select nombre from public.usuarios where id_usuario = u_pac1) = 'Juanito'
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: edita su nombre'::text; end if;

  begin
    update public.usuarios set rol = 'Administrador' where id_usuario = u_pac1;
    fallidas := fallidas || 'paciente: no cambia su rol'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;
  begin
    update public.usuarios set estado = false where id_usuario = u_pac1;
    fallidas := fallidas || 'paciente: no cambia su estado'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;
  begin
    update public.usuarios set correo = 'otro@mindtrack.test' where id_usuario = u_pac1;
    fallidas := fallidas || 'paciente: no cambia su correo fuera de Auth'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;
  begin
    update public.usuarios set nombre = 'X' where id_usuario = u_pac2;
    get diagnostics n = row_count;
    if n = 0 then correctas := correctas + 1; else fallidas := fallidas || 'paciente: no edita perfiles ajenos'::text; end if;
  end;
  begin
    update public.pacientes set id_usuario = u_pac2 where id_usuario = u_pac1;
    fallidas := fallidas || 'paciente: no reasigna su ficha'::text;
  exception when insufficient_privilege or unique_violation or raise_exception then correctas := correctas + 1;
  end;
  begin
    update public.pacientes set fecha_nacimiento = '2002-05-10', genero = 'Masculino' where id_usuario = u_pac1;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('paciente: completa su ficha (' || sqlerrm || ')');
  end;

  begin
    insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora) values (p2, d1, serv, '2099-01-10', '10:00');
    fallidas := fallidas || 'paciente: no agenda citas para otro paciente'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora, estado) values (p1, d1, serv, '2099-01-10', '10:00', 'Confirmada');
    fallidas := fallidas || 'paciente: no crea una cita ya confirmada'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora, lugar)
      values (p1, d1, serv, '2099-01-10', '10:00', 'Consultorio 204') returning id_cita into cita1;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('paciente: agenda su cita pendiente (' || sqlerrm || ')');
  end;
  begin
    insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora) values (p1, d1, serv, '2099-01-10', '10:00');
    fallidas := fallidas || 'paciente: no hay doble reserva del doctor'::text;
  exception when unique_violation then correctas := correctas + 1;
  end;
  begin
    update public.citas set estado = 'Confirmada' where id_cita = cita1;
    fallidas := fallidas || 'paciente: no confirma su propia cita'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  delete from public.citas where id_cita = cita1;
  get diagnostics n = row_count;
  if n = 0 then correctas := correctas + 1; else fallidas := fallidas || 'paciente: no borra citas'::text; end if;
  begin
    insert into public.pagos (id_cita, valor, metodo) values (cita1, 1, 'Nequi');
    fallidas := fallidas || 'paciente: no registra pagos'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.servicios (nombre, valor) values ('Servicio gratis', 0);
    fallidas := fallidas || 'paciente: no crea servicios'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.historial_clinico (id_paciente, id_doctor, diagnostico) values (p1, d1, 'x');
    fallidas := fallidas || 'paciente: no escribe historial clínico'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;

  -- Registro diario: ánimo del día y luego el registro completo en la misma fila.
  begin
    insert into public.estados_animo (id_paciente, dia, estado) values (p1, hoy, 'Feliz');
    insert into public.estados_animo (id_paciente, dia, emociones, estres, calidad_sueno, energia, apetito,
                                      comentario, afrontamiento, orgullo)
      values (p1, hoy, '{Calma,Esperanza}', 30, 70, 65, 50, 'Hoy pasé tiempo con mi familia.', '{Familia,Música}', 'Hice nuevos amigos')
      on conflict (id_paciente, dia) do update set
        emociones = excluded.emociones, estres = excluded.estres, calidad_sueno = excluded.calidad_sueno,
        energia = excluded.energia, apetito = excluded.apetito, comentario = excluded.comentario,
        afrontamiento = excluded.afrontamiento, orgullo = excluded.orgullo;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('paciente: guarda ánimo y registro completo (' || sqlerrm || ')');
  end;
  if (select count(*) from public.estados_animo where id_paciente = p1) = 1
     and (select estado = 'Feliz' and energia = 65 from public.estados_animo where id_paciente = p1)
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: registro diario en una fila por día'::text; end if;
  begin
    insert into public.estados_animo (id_paciente, dia, estres) values (p1, hoy - 1, 150);
    fallidas := fallidas || 'registro diario: escalas de 0 a 100'::text;
  exception when check_violation then correctas := correctas + 1;
  end;
  begin
    insert into public.estados_animo (id_paciente, dia) values (p1, hoy - 2);
    fallidas := fallidas || 'registro diario: no se guardan filas vacías'::text;
  exception when check_violation then correctas := correctas + 1;
  end;
  begin
    insert into public.estados_animo (id_paciente, dia, comentario) values (p1, hoy - 3, repeat('a', 301));
    fallidas := fallidas || 'registro diario: diario de máximo 300 caracteres'::text;
  exception when check_violation then correctas := correctas + 1;
  end;
  begin
    insert into public.estados_animo (id_paciente, dia, estado) values (p2, hoy, 'Triste');
    fallidas := fallidas || 'paciente: no registra el ánimo de otro paciente'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;

  begin
    insert into public.actividades (id_paciente, tipo, fecha, hora, lugar) values (p1, 'Ejercicio', '2099-01-11', '07:00', 'Parque');
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('paciente: agenda su actividad (' || sqlerrm || ')');
  end;
  begin
    insert into public.actividades (id_paciente, tipo, fecha, hora) values (p2, 'Otro', '2099-01-11', '07:00');
    fallidas := fallidas || 'paciente: no crea actividades de otro paciente'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  reset role;

  -- ---------- Paciente 2 ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_pac2, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.citas where id_paciente = p1) = 0
     and (select count(*) from public.estados_animo where id_paciente = p1) = 0
     and (select count(*) from public.actividades where id_paciente = p1) = 0
     and (select count(*) from public.pacientes) = 1
     and not exists (select 1 from public.usuarios where id_usuario = u_pac1)
    then correctas := correctas + 1; else fallidas := fallidas || 'otro paciente: no ve datos del paciente 1'::text; end if;
  reset role;

  -- ---------- Doctora del paciente 1 ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_doc1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if exists (select 1 from public.pacientes where id_paciente = p1)
     and not exists (select 1 from public.pacientes where id_paciente = p2)
     and exists (select 1 from public.usuarios where id_usuario = u_pac1)
     and not exists (select 1 from public.usuarios where id_usuario = u_pac2)
    then correctas := correctas + 1; else fallidas := fallidas || 'doctora: ve solo a sus pacientes'::text; end if;
  if (select count(*) from public.estados_animo where id_paciente = p1) = 1
     and (select count(*) from public.actividades) = 0
     and (select count(*) from public.pagos) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'doctora: ve el registro diario, pero no la agenda personal ni pagos'::text; end if;

  begin
    update public.citas set estado = 'Confirmada' where id_cita = cita1;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('doctora: actualiza su cita (' || sqlerrm || ')');
  end;
  if (select estado from public.citas where id_cita = cita1) = 'Confirmada'
    then correctas := correctas + 1; else fallidas := fallidas || 'doctora: confirma su cita'::text; end if;
  begin
    update public.citas set id_paciente = p2 where id_cita = cita1;
    fallidas := fallidas || 'doctora: no cambia el paciente de una cita'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    update public.citas set id_doctor = d2 where id_cita = cita1;
    fallidas := fallidas || 'doctora: no pasa su cita a otro doctor'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.historial_clinico (id_paciente, id_doctor, diagnostico) values (p2, d1, 'x');
    fallidas := fallidas || 'doctora: no escribe historial de pacientes que no atiende'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.historial_clinico (id_paciente, id_doctor, diagnostico) values (p1, d2, 'x');
    fallidas := fallidas || 'doctora: no escribe a nombre de otro doctor'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    insert into public.historial_clinico (id_paciente, id_doctor, diagnostico, tratamiento) values (p1, d1, 'Ansiedad leve', 'Terapia');
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('doctora: escribe historial de su paciente (' || sqlerrm || ')');
  end;
  begin
    update public.historial_clinico set id_paciente = p2 where id_paciente = p1;
    fallidas := fallidas || 'doctora: no mueve un historial a otro paciente'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    update public.estados_animo set estado = 'Muy Triste' where id_paciente = p1;
    get diagnostics n = row_count;
    if n = 0 then correctas := correctas + 1; else fallidas := fallidas || 'doctora: no modifica el registro diario'::text; end if;
  end;
  begin
    update public.usuarios set rol = 'Administrador' where id_usuario = u_doc1;
    fallidas := fallidas || 'doctora: no cambia su rol'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;
  reset role;

  -- ---------- Doctor sin citas y doctor sin aprobar ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_doc2, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.pacientes where id_paciente in (p1, p2)) = 0
     and (select count(*) from public.citas where id_paciente in (p1, p2)) = 0
     and (select count(*) from public.historial_clinico where id_paciente in (p1, p2)) = 0
     and (select count(*) from public.estados_animo where id_paciente in (p1, p2)) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'doctor sin citas: no ve pacientes'::text; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', u_falso, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.pacientes where id_paciente in (p1, p2)) = 0
     and (select count(*) from public.citas where id_paciente in (p1, p2)) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'doctor sin aprobar: no ve pacientes'::text; end if;
  reset role;

  -- ---------- Paciente 1: historial, cancelación ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_pac1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.historial_clinico where id_paciente = p1) = 1
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: lee su historial'::text; end if;
  update public.citas set fecha = '2099-02-01' where id_cita = cita1;
  get diagnostics n = row_count;
  if n = 0 then correctas := correctas + 1; else fallidas := fallidas || 'paciente: no cambia una cita ya confirmada'::text; end if;
  begin
    insert into public.citas (id_paciente, id_doctor, id_servicio, fecha, hora) values (p1, d1, serv, '2099-01-12', '11:00') returning id_cita into cita2;
    update public.citas set estado = 'Cancelada' where id_cita = cita2;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('paciente: agenda y cancela otra cita (' || sqlerrm || ')');
  end;
  if (select estado from public.citas where id_cita = cita2) = 'Cancelada'
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: cancela su cita pendiente'::text; end if;
  update public.citas set estado = 'Pendiente' where id_cita = cita2;
  get diagnostics n = row_count;
  if n = 0 then correctas := correctas + 1; else fallidas := fallidas || 'paciente: no reactiva una cita cancelada'::text; end if;
  reset role;

  -- ---------- Administrador: pagos, desactivación, correo ----------
  perform set_config('request.jwt.claims', json_build_object('sub', u_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    insert into public.pagos (id_cita, valor, metodo, estado) values (cita1, 1000, 'Nequi', 'Pagado');
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('admin: registra pagos (' || sqlerrm || ')');
  end;
  begin
    update public.usuarios set correo = 'otro@mindtrack.test' where id_usuario = u_pac1;
    fallidas := fallidas || 'admin: tampoco cambia el correo fuera de Auth'::text;
  exception when raise_exception then correctas := correctas + 1;
  end;
  begin
    update public.usuarios set estado = false where id_usuario = u_doc1;
    correctas := correctas + 1;
  exception when others then fallidas := fallidas || ('admin: desactiva a un doctor (' || sqlerrm || ')');
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', u_pac1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.pagos where id_cita = cita1) = 1
    then correctas := correctas + 1; else fallidas := fallidas || 'paciente: ve sus pagos'::text; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', u_pac2, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.pagos where id_cita = cita1) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'otro paciente: no ve pagos ajenos'::text; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', u_doc1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if (select count(*) from public.pacientes where id_paciente = p1) = 0
     and (select count(*) from public.historial_clinico where id_paciente = p1) = 0
    then correctas := correctas + 1; else fallidas := fallidas || 'doctora desactivada: pierde el acceso'::text; end if;
  reset role;

  -- ---------- Sin sesión ----------
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    perform 1 from public.usuarios limit 1;
    fallidas := fallidas || 'anon: no lee usuarios'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    perform 1 from public.servicios limit 1;
    fallidas := fallidas || 'anon: no lee catálogos'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  begin
    perform private.es_admin();
    fallidas := fallidas || 'anon: no usa el esquema private'::text;
  exception when insufficient_privilege then correctas := correctas + 1;
  end;
  reset role;

  -- ---------- Supabase Auth ----------
  update auth.users set email = 'paciente2.nuevo@mindtrack.test' where id = u_pac2;
  if exists (select 1 from public.usuarios where id_usuario = u_pac2 and correo = 'paciente2.nuevo@mindtrack.test')
    then correctas := correctas + 1; else fallidas := fallidas || 'auth: el correo se sincroniza'::text; end if;
  begin
    delete from auth.users where id = u_pac1;
    fallidas := fallidas || 'auth: una cuenta con registros clínicos no se borra'::text;
  exception when foreign_key_violation then correctas := correctas + 1;
  end;
  delete from auth.users where id = u_hacker;
  if not exists (select 1 from public.usuarios where id_usuario = u_hacker)
    then correctas := correctas + 1; else fallidas := fallidas || 'auth: borrar una cuenta sin registros borra su perfil'::text; end if;

  -- ---------- Resultado (deshace todo) ----------
  raise exception 'PRUEBAS MINDTRACK: % correctas, % fallidas%',
    correctas, cardinality(fallidas),
    case when cardinality(fallidas) > 0 then E'\n- ' || array_to_string(fallidas, E'\n- ') else '' end;
end;
$$;
