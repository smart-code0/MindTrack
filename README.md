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
```

## Notas

- Los estilos usan `StyleSheet` de React Native; los iconos son los mismos SVG de
  Iconify y Font Awesome del diseño original, incluidos en `constants/icons.ts`.
- Las citas se guardan en el dispositivo con AsyncStorage.
- Los datos de Inicio, Ajustes y Estadísticas son valores de ejemplo.
- La autenticación, la base de datos y los roles se conectarán con Supabase
  en una fase posterior.
