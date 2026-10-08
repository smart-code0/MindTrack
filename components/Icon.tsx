import { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ICONS, IconName } from '@/constants/icons';

type Props = {
  name: IconName;
  /** Equivale al font-size del icono en el CSS original (alto del icono). */
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
};

/** Dibuja los mismos iconos de Iconify / Font Awesome que usaba el prototipo HTML. */
export function Icon({ name, size, color, style }: Props) {
  const { w, h, body } = ICONS[name];
  const xml = useMemo(
    () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`,
    [w, h, body],
  );
  return <SvgXml xml={xml} width={(size * w) / h} height={size} color={color} style={style} />;
}
