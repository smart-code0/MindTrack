import { Href, router } from 'expo-router';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

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
      accessibilityRole="link"
      accessibilityLabel="Volver"
      style={style}
    >
      <Icon name="material-symbols-light:arrow-back-rounded" size={size} color={color} />
    </Pressable>
  );
}
