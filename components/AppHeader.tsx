import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { Icon } from './Icon';

type Props = {
  /** Color del icono de perfil (varía por pantalla en el original). */
  iconColor?: string;
  /** Desplazamiento vertical del icono de perfil (home lo bajaba 7 px). */
  iconOffsetY?: number;
};

/** Cabecera con el logo centrado y el acceso al perfil (app-header.css). */
export function AppHeader({ iconColor = colors.ink, iconOffsetY = 0 }: Props) {
  return (
    <View style={styles.header}>
      <Image source={require('@/img/MindTrack-Logo.png')} style={styles.logo} accessibilityLabel="MindTrack" />
      <Pressable
        style={styles.profile}
        onPress={() => router.navigate('/ajustes')}
        accessibilityRole="button"
        accessibilityLabel="Perfil"
      >
        <Icon name="solar:user-outline" size={20} color={iconColor} style={{ transform: [{ translateY: iconOffsetY }] }} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 125, height: 125 * (113 / 386) },
  profile: {
    position: 'absolute',
    right: 20,
    top: 13.5,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
