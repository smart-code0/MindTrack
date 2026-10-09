# MindTrack

Aplicación móvil de seguimiento del bienestar emocional, desarrollada con
**React Native + TypeScript + Expo + Expo Router**.

## Requisitos

- Node.js 20 o superior
- La app **Expo Go** en el teléfono (Android o iOS), o un emulador

## Cómo ejecutar

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iOS).

Otros comandos:

```bash
npm run typecheck   # comprobación de tipos de TypeScript
npm run android     # abrir en un emulador Android
npm run ios         # abrir en un simulador iOS (macOS)
npm run build:web   # versión web en dist/ (la que publica Vercel)
```

## Versión web (Vercel)

Vercel publica una versión web de la app para verla desde el navegador.
`vercel.json` le indica que ejecute `npm run build:web` y sirva la carpeta `dist/`.
La aplicación principal sigue siendo la app móvil.

## Estructura

```
app/                 Pantallas y rutas (Expo Router)
  _layout.tsx        Navegación (Stack), fuentes y barra de estado
  index.tsx          Iniciar sesión
  registro.tsx       Crear cuenta
  rol.tsx            Elegir rol
  recuperar.tsx      Recuperar contraseña
  home.tsx           Inicio
  ajustes.tsx        Perfil y ajustes
  estadisticas.tsx   Resumen emocional
  citas/             Agendar cita (index) y nueva cita (nueva)
  reporte/           Registro diario: emociones → intensidad → diario →
                     afrontamiento → orgullo → completado
components/          Componentes reutilizables (cabecera, barra inferior, botones,
                     iconos, campos, slider, interruptor, selector)
constants/           Tema (colores, fuentes, degradados), iconos y estilos compartidos
services/            Acceso a datos (citas guardadas en el dispositivo)
types/               Tipos de TypeScript
img/                 Imágenes de la app (logo y gráfica)
supabase/
  migrations/        Esquema de la base de datos (tablas, RLS y triggers)
  seed.sql           Catálogos: especialidades y servicios
  datos_demo.sql     Datos de demostración y consultas de comprobación
```

## Base de datos (Supabase)

La base de datos es PostgreSQL en Supabase. Las cuentas y contraseñas las
gestiona **Supabase Auth**; la tabla `usuarios` guarda solo el perfil y se crea
automáticamente cuando alguien se registra.

Tablas: `usuarios`, `especialidades`, `doctores`, `pacientes`, `servicios`,
`citas`, `historial_clinico`, `estados_animo` y `pagos`.

### Aplicar el esquema

En el **SQL Editor** del proyecto de Supabase, ejecutar en este orden:

1. `supabase/migrations/20261009120000_esquema_inicial.sql`
2. `supabase/seed.sql`
3. (Opcional) Crear en **Authentication → Users → Add user** las cuentas
   `admin@mindtrack.com`, `laura@mindtrack.com` y `juan@mindtrack.com`, y luego
   ejecutar `supabase/datos_demo.sql`.

Con la CLI de Supabase (después de `supabase init` y `supabase link`),
`supabase db push` aplica la migración.

### Registro desde la app

`supabase.auth.signUp()` puede enviar en `options.data` los campos `nombre`,
`apellido`, `telefono` y `rol` (`'Paciente'` o `'Doctor'`). Sin `rol`, la cuenta
queda como Paciente. Nadie puede registrarse como Administrador.

### Seguridad (Row Level Security)

- **Paciente:** ve y edita sus propios datos, agenda citas en estado Pendiente y
  puede cambiarlas o cancelarlas mientras sigan pendientes. Registra sus estados
  de ánimo y ve su historial y sus pagos.
- **Doctor:** ve solo a los pacientes con los que tiene citas no canceladas
  (perfil, historial y estados de ánimo), gestiona sus citas y escribe el
  historial clínico. Elegir "Doctor" al registrarse no basta: un administrador
  debe crear su fila en `doctores` (especialidad y licencia).
- **Administrador:** gestiona usuarios, roles, doctores, especialidades,
  servicios, citas y pagos. No tiene acceso al historial clínico ni a los
  estados de ánimo.
- Solo un administrador cambia el rol o el estado de un usuario. El correo se
  cambia con Supabase Auth y se copia solo a `usuarios`.
- Un doctor o administrador desactivado (`estado = false`) pierde sus permisos.
- Sin sesión iniciada no se puede consultar ningún dato.
- Una cuenta con citas, historial, estados de ánimo o pagos no se puede borrar
  (los registros clínicos se conservan); se desactiva con `estado = false`.

## Notas

- Los estilos usan `StyleSheet` de React Native; los iconos son los mismos SVG de
  Iconify y Font Awesome del diseño original, incluidos en `constants/icons.ts`.
- Las citas se guardan en el dispositivo con AsyncStorage.
- Los datos de Inicio, Ajustes y Estadísticas son valores de ejemplo.
- El esquema de la base de datos está listo en `supabase/`; la conexión de la
  app con Supabase (registro, inicio de sesión y datos) es la siguiente fase.
