import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { RangeSlider } from '@/components/RangeSlider';
import { Screen } from '@/components/Screen';
import { StepFooter } from '@/components/StepFooter';
import { fonts } from '@/constants/theme';
import { reportStyles } from '@/constants/reportStyles';

const FACTORS = ['Stress', 'Sleep Quality', 'Energy', 'Appetite'];

/** Registro diario 2/5: intensidad de las emociones (Reporte02.html). */
export default function IntensityScreen() {
  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#dfe4ef">
      <AppHeader iconColor="#000000" iconOffsetY={-3} />

      <ScrollView style={reportStyles.flex} contentContainerStyle={styles.content} bounces={false}>
        <BackButton href="/reporte/emociones" style={reportStyles.back} />
        <Text style={reportStyles.title}>Rate your day</Text>
        <Text style={[reportStyles.subtitle, styles.subtitle]}>How intense were these emotions today?</Text>

        {FACTORS.map((label) => (
          <View key={label} style={styles.factor}>
            <Text style={styles.label}>{label}</Text>
            <RangeSlider
              height={24}
              trackTop={12}
              trackHeight={6}
              trackColor="#d4dae7"
              trackRadius={20}
              thumbWidth={30}
              thumbHeight={20}
              thumbRadius={8.4}
              thumbShadow="0px 2px 8px rgba(0, 0, 0, 0.25)"
              thumbOffset={-9}
            />
            <View style={styles.levels}>
              <Text style={styles.level}>Low</Text>
              <Text style={styles.level}>High</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <StepFooter step="2/5" href="/reporte/diario" variant="stacked" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 35, paddingHorizontal: 30 },
  subtitle: { marginBottom: 25 },
  factor: { marginBottom: 20 },
  label: { ...fonts.poppins(500), fontSize: 15, lineHeight: 23, color: '#333333', marginBottom: 18 },
  levels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  level: { ...fonts.poppins(), fontSize: 14, lineHeight: 21, color: '#666666' },
});
