import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

import { horizontal } from '@/constants/theme';

type Props = {
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  /** Tamaño, márgenes, radio y sombra del botón. */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Estilo del contenido (alineación de icono + texto). */
  contentStyle?: StyleProp<ViewStyle>;
};

/** Botón con fondo degradado horizontal (CSS `linear-gradient(90deg, ...)`). */
export function GradientButton({ label, children, onPress, colors, locations, style, textStyle, contentStyle }: Props) {
  const radius = StyleSheet.flatten(style)?.borderRadius;
  return (
    <Pressable onPress={onPress} role="button" style={style}>
      <LinearGradient
        colors={colors}
        locations={locations}
        {...horizontal}
        style={[styles.fill, { borderRadius: radius }, contentStyle]}
      >
        {label !== undefined && <Text style={textStyle}>{label}</Text>}
        {children}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
