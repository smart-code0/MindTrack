import { Href, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, gradients } from '@/constants/theme';
import { BottomNav } from './BottomNav';
import { GradientButton } from './GradientButton';

type Props = {
  /** Texto "n/5" del paso. */
  step: string;
  href: Href;
  label?: string;
  /**
   * stacked: reporte 1–3 (botón arriba y la barra 35 px debajo; deja 2 px libres al final).
   * centered: reporte 4–5 (botón centrado en una franja de 108 px sobre la barra).
   */
  variant: 'stacked' | 'centered';
  /** Reporte 3 usaba Arial para el número de paso. */
  arialStep?: boolean;
  /** Fondo de la franja del botón (en reporte 4–5 era el del contenido). */
  backgroundColor?: string;
  /** Incluir la barra inferior (en reporte 4–5 va fija fuera del contenido desplazable). */
  withNav?: boolean;
};

/** Pie del registro diario: botón Continue/Finish, número de paso y barra inferior. */
export function StepFooter({ step, href, label = 'Continue', variant, arialStep, backgroundColor, withNav = true }: Props) {
  const stacked = variant === 'stacked';
  return (
    <View>
      <View style={[stacked ? styles.stacked : styles.centered, { backgroundColor }]}>
        <GradientButton
          label={label}
          onPress={() => router.navigate(href)}
          colors={stacked ? gradients.continue : gradients.continueAlt}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <Text
          style={[
            styles.step,
            stacked ? styles.stepStacked : styles.stepCentered,
            arialStep ? fonts.arial() : fonts.poppins(),
          ]}
        >
          {step}
        </Text>
      </View>
      {withNav && <BottomNav />}
      {stacked && <View style={styles.gap} />}
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: { height: 78, alignItems: 'center' },
  centered: { height: 108, alignItems: 'center', justifyContent: 'center' },
  button: {
    width: 194,
    height: 43,
    borderRadius: 10,
    boxShadow: '0px 4px 10px rgba(90, 110, 220, 0.4)',
  },
  buttonText: { ...fonts.arial(), fontSize: 18, color: '#ffffff' },
  step: { position: 'absolute', right: 35, fontSize: 15 },
  stepStacked: { top: 15, color: '#444444' },
  stepCentered: { top: 40, color: '#333333' },
  gap: { height: 2 },
});
