import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { Screen } from '@/components/Screen';
import { StepFooter } from '@/components/StepFooter';
import { fonts } from '@/constants/theme';
import { reportStyles } from '@/constants/reportStyles';

type Tone = 'blue' | 'purple';

const EMOTIONS: { label: string; tone: Tone }[] = [
  { label: 'Calm', tone: 'blue' },
  { label: 'Motivated', tone: 'purple' },
  { label: 'Tired', tone: 'blue' },
  { label: 'Angry', tone: 'purple' },
  { label: 'Lonely', tone: 'blue' },
  { label: 'Hopeful', tone: 'purple' },
  { label: 'Nervous', tone: 'blue' },
  { label: 'Stressed', tone: 'purple' },
  { label: 'Swamped', tone: 'blue' },
];

/** Registro diario 1/5: emociones del día (Reporte01.html). Selección múltiple, como reporte.js. */
export default function EmotionsScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // En el navegador el último botón pulsado quedaba con el estilo :focus.
  const [focused, setFocused] = useState<string | null>(null);

  const toggle = (label: string) => {
    setFocused(label);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#dfe4ef">
      <AppHeader />

      <ScrollView style={reportStyles.flex} contentContainerStyle={styles.content} bounces={false}>
        <BackButton href="/home" style={reportStyles.back} />
        <Text style={reportStyles.title}>Tell us!</Text>
        <Text style={[reportStyles.subtitle, styles.subtitle]}>Which emotions did you feel today?</Text>

        <View style={styles.grid}>
          {EMOTIONS.map(({ label, tone }) => {
            const state = selected.has(label) ? 'selected' : focused === label ? 'focus' : null;
            return (
              <Pressable
                key={label}
                onPress={() => toggle(label)}
                style={[styles.emotion, state && TONE_STYLES[tone][state]]}
                role="checkbox"
                aria-checked={selected.has(label)}
              >
                <Text style={styles.emotionText}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StepFooter step="1/5" href="/reporte/intensidad" variant="stacked" />
    </Screen>
  );
}

const SHADOW = '0px 3px 7px rgba(0, 0, 0, 0.18)';

const styles = StyleSheet.create({
  content: { paddingVertical: 35, paddingHorizontal: 30 },
  subtitle: { marginBottom: 45 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 26, rowGap: 30 },
  emotion: {
    width: 90,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8c8c8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: SHADOW,
  },
  emotionText: { ...fonts.arial(), fontSize: 15, color: '#555555' },
  blueSelected: { backgroundColor: '#e4f2fb', borderColor: '#a8c5e0', boxShadow: '0px 3px 7px #e4f2fb' },
  blueFocus: {
    backgroundColor: '#dceefb',
    borderColor: '#a8c5e0',
    boxShadow: `${SHADOW}, 0px 0px 8px rgba(227, 228, 228, 0.4)`,
  },
  purpleSelected: {
    backgroundColor: '#e8d9f2',
    borderColor: '#bca6c8',
    boxShadow: `${SHADOW}, 0px 0px 8px rgba(188, 166, 200, 0.4)`,
  },
});

const TONE_STYLES = {
  blue: { selected: styles.blueSelected, focus: styles.blueFocus },
  // En morado, :focus y .selected tenían el mismo aspecto.
  purple: { selected: styles.purpleSelected, focus: styles.purpleSelected },
};
