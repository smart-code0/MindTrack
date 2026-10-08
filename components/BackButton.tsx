import { Href, router } from 'expo-router';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Icon } from './Icon';

type Props = {
  href: Href;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Flecha para volver a la pantalla anterior (enlace con arrow-back-rounded). */
export function BackButton({ href, size = 22, color = '#000000', style }: Props) {
  return (
    <Pressable
      onPress={() => router.navigate(href)}
      hitSlop={12}
      role="link"
      aria-label="Volver"
      style={style}
    >
      <Icon name="material-symbols-light:arrow-back-rounded" size={size} color={color} />
    </Pressable>
  );
}

/** Fila de 20 px con la flecha gris (.back-area de citas, nueva cita y estadísticas). */
export function BackArea({ href }: { href: Href }) {
  return (
    <View style={styles.area}>
      <BackButton href={href} size={21} color="#333333" style={styles.areaButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  area: { height: 20 },
  areaButton: { position: 'absolute', left: 3, top: 0 },
});
