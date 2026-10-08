import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { GradientButton } from '@/components/GradientButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { fonts } from '@/constants/theme';

/** Registro diario completado (Reporte06.html). */
export default function CompletedScreen() {
  return (
    <Screen backgroundColor="#EEF3FF" outerColor="#ECECEC">
      <AppHeader iconColor="#000000" />

      <ScrollView contentContainerStyle={styles.main} bounces={false}>
        <View style={styles.card}>
          <View style={styles.check}>
            <Icon name="fa-solid:check" size={30} color="#3F46FF" />
          </View>
          <Text style={styles.title}>Daily log completed!</Text>
          <Text style={styles.text}>{'Thank you for taking the time\nto reflect on your day.'}</Text>
          <Text style={styles.text}>
            {'Your information has been saved\nand will help you and your care\nteam monitor your progress.'}
          </Text>
        </View>

        <GradientButton
          label="Go Home"
          onPress={() => router.navigate('/home')}
          colors={['#5E93FF', '#9A76DA']}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </ScrollView>

      {/* La barra estaba posicionada sobre la parte inferior de la pantalla. */}
      <BottomNav style={styles.nav} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Alto mínimo para que en pantallas bajas el botón no tape la tarjeta.
  main: { flexGrow: 1, minHeight: 640 },
  card: {
    position: 'absolute',
    top: 98,
    alignSelf: 'center',
    width: 342,
    height: 365,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 14,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  check: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: '#3F46FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 38,
  },
  title: { ...fonts.poppins(500), fontSize: 17, color: '#4B4B4B', marginBottom: 28, textAlign: 'center' },
  text: { ...fonts.poppins(), fontSize: 15, lineHeight: 24.75, color: '#666666', marginBottom: 22, textAlign: 'center' },
  button: {
    position: 'absolute',
    bottom: 102,
    alignSelf: 'center',
    width: 194,
    height: 43,
    borderRadius: 10,
    boxShadow: '0px 4px 12px rgba(94, 147, 255, 0.28)',
  },
  buttonText: { ...fonts.poppins(500), fontSize: 18, color: '#ffffff' },
  nav: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
