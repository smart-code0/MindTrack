import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, DESIGN_WIDTH } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Fondo de la pantalla (el fondo del marco de teléfono en el HTML). */
  backgroundColor: string;
  /** Fondo de la página alrededor de la columna en pantallas anchas (body en el HTML). */
  outerColor?: string;
  /** Color bajo la barra de estado del sistema (en el HTML, la barra simulada era blanca). */
  topColor?: string;
  /** Añade el margen inferior del sistema (pantallas sin barra de navegación inferior). */
  bottomInset?: boolean;
};

/**
 * Contenedor de cada pantalla. En móviles ocupa toda la pantalla, como el CSS original
 * bajo 480 px; en pantallas anchas centra una columna de 390 px, como el marco de teléfono.
 */
export function Screen({ children, backgroundColor, outerColor = '#eef3ff', topColor = colors.white, bottomInset }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 480;

  return (
    <View style={[styles.outer, { backgroundColor: wide ? outerColor : backgroundColor }]}>
      <View
        style={[
          styles.column,
          wide && styles.columnWide,
          { backgroundColor, paddingBottom: bottomInset ? insets.bottom : 0 },
        ]}
      >
        <View style={{ height: insets.top, backgroundColor: topColor }} />
        {/* En iOS el teclado no redimensiona la pantalla: se deja espacio para que no tape los campos. */}
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {children}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%', overflow: 'hidden' },
  columnWide: { maxWidth: DESIGN_WIDTH },
  flex: { flex: 1 },
});
