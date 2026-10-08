import { Platform, TextStyle } from 'react-native';

/**
 * Tipografías del prototipo original.
 * - Poppins: pantallas que cargaban Google Fonts (rol, home, nueva cita y reporte 1, 2, 4, 5, 6).
 * - Arial: pantallas que no cargaban Poppins y por eso se veían con Arial
 *   (login, registro, recuperar, ajustes, citas, estadísticas y reporte 3), además de
 *   los botones y campos, que en el navegador no heredan la fuente de la página.
 */
const POPPINS = {
  300: 'Poppins_300Light',
  400: 'Poppins_400Regular',
  500: 'Poppins_500Medium',
  600: 'Poppins_600SemiBold',
  700: 'Poppins_700Bold',
} as const;

const ARIAL = Platform.select({
  ios: 'Arial',
  android: 'sans-serif',
  default: 'Arial, Helvetica, sans-serif',
});

type PoppinsWeight = keyof typeof POPPINS;

export const fonts = {
  poppins: (weight: PoppinsWeight = 400): TextStyle => ({ fontFamily: POPPINS[weight] }),
  /** Arial solo tiene normal y negrita: 100–500 se ven normales y 600–900 en negrita. */
  arial: (bold = false): TextStyle => ({ fontFamily: ARIAL, fontWeight: bold ? '700' : '400' }),
};

/** Archivos de fuente que se cargan al iniciar la app. */
export const fontAssets = {
  [POPPINS[300]]: require('@expo-google-fonts/poppins/300Light/Poppins_300Light.ttf'),
  [POPPINS[400]]: require('@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf'),
  [POPPINS[500]]: require('@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf'),
  [POPPINS[600]]: require('@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf'),
  [POPPINS[700]]: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
};

/** Colores repetidos en varias pantallas. */
export const colors = {
  white: '#ffffff',
  headerBorder: '#d9d9d9',
  navBorder: '#d8d8d8',
  navIcon: '#777777',
  navIconActive: '#5b84ea',
  ink: '#14142b',
};

/** Degradados horizontales (CSS `linear-gradient(90deg, ...)`). */
export const gradients = {
  /** Botón Continue de reporte 1–3. */
  continue: ['#5B84EA', '#9671D6'],
  /** Botones Continue / Finish de reporte 4–5. */
  continueAlt: ['#5d91eb', '#9b73d1'],
  /** Login, Create account, Log my full day, Create appointment. */
  primary: ['#628BEA', '#7B85DB', '#957FCB'],
} as const;

export const horizontal = { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } } as const;
export const vertical = { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } } as const;
export const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const;

/** Ancho del diseño original (marco de teléfono de 390 px). */
export const DESIGN_WIDTH = 390;
