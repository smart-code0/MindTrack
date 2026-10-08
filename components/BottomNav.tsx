import { Href, router } from 'expo-router';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { IconName } from '@/constants/icons';
import { Icon } from './Icon';

const ITEMS: { href: Href; icon: IconName; label: string }[] = [
  { href: '/home', icon: 'fa7-regular:home', label: 'Inicio' },
  { href: '/estadisticas', icon: 'material-symbols-light:bar-chart-4-bars', label: 'Estadísticas' },
  { href: '/citas', icon: 'griddy-icons:calendar', label: 'Citas' },
];

type Props = {
  /** Índice del icono resaltado (solo "Nueva cita" lo marcaba en el original). */
  activeIndex?: number;
  style?: StyleProp<ViewStyle>;
};

/** Barra de navegación inferior con los tres accesos principales (footer-nav.css). */
export function BottomNav({ activeIndex, style }: Props) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { height: 70 + bottom, paddingBottom: bottom }, style]}>
      {ITEMS.map((item, i) => (
        <Pressable
          key={item.label}
          style={styles.link}
          onPress={() => router.navigate(item.href)}
          accessibilityRole="link"
          accessibilityLabel={item.label}
        >
          <Icon name={item.icon} size={28} color={i === activeIndex ? colors.navIconActive : colors.navIcon} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  link: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
