import { StyleSheet } from 'react-native';

import { fonts } from './theme';

/** Estilos repetidos en las pantallas del registro diario. */
export const reportStyles = StyleSheet.create({
  flex: { flex: 1 },
  /** Flecha de volver de reporte 1 y 2 (.back-button, 34 px bajo la cabecera). */
  back: { position: 'absolute', top: 34, left: 15, zIndex: 10 },
  /** Título y subtítulo de reporte 1 y 2. */
  title: { ...fonts.poppins(500), fontSize: 20, color: '#2d2d2d', textAlign: 'center' },
  subtitle: { ...fonts.poppins(), fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 5 },
  /** Contenido de reporte 4 y 5 (.content). */
  content: { flexGrow: 1, backgroundColor: '#f3f6fc', paddingTop: 28 },
  /** Flecha de volver de reporte 4 y 5. */
  backAlt: { position: 'absolute', top: 25, left: 19, zIndex: 20 },
  /** Pregunta de reporte 4 y 5. */
  question: { ...fonts.poppins(), fontSize: 18, lineHeight: 22, color: '#222222', textAlign: 'center' },
  questionHint: { ...fonts.poppins(), fontSize: 14, lineHeight: 17, color: '#444444', textAlign: 'center', marginTop: 2 },
});
