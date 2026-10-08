import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Screen } from '@/components/Screen';
import { StepFooter } from '@/components/StepFooter';
import { fonts } from '@/constants/theme';
import { reportStyles } from '@/constants/reportStyles';

type Tone = 'blue' | 'purple';

const OPTIONS: { label: string; tone: Tone }[] = [
  { label: 'Outdoors', tone: 'blue' },
  { label: 'Rest', tone: 'purple' },
  { label: 'Medication', tone: 'purple' },
  { label: 'Meditation', tone: 'blue' },
  { label: 'Exercise', tone: 'blue' },
  { label: 'Talked', tone: 'purple' },
  { label: 'Therapy', tone: 'purple' },
  { label: 'Journal', tone: 'blue' },
  { label: 'Music', tone: 'blue' },
  { label: 'Family', tone: 'purple' },
];

const NONE = 'None of these';

/** Registro diario 4/5: cómo lo afrontaste (Reporte04.html). Casillas independientes, como en el HTML. */
export default function CopingScreen() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (label: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const option = (label: string, tone: Tone, extraStyle?: object) => (
    <Pressable
      key={label}
      onPress={() => toggle(label)}
      style={({ pressed }) => [
        styles.option,
        extraStyle,
        checked.has(label) && (tone === 'blue' ? styles.blueChecked : styles.purpleChecked),
        pressed && styles.pressed,
      ]}
      role="checkbox"
      aria-checked={checked.has(label)}
    >
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#eeeeee">
      <AppHeader />

      <ScrollView style={reportStyles.flex} contentContainerStyle={reportStyles.content} bounces={false}>
        <BackButton href="/reporte/diario" color="#333333" style={reportStyles.backAlt} />
        <Text style={reportStyles.question}>How did you cope today?</Text>
        <Text style={reportStyles.questionHint}>Select everything that applies.</Text>

        <View style={styles.options}>{OPTIONS.map(({ label, tone }) => option(label, tone))}</View>

        {option(NONE, 'blue', styles.none)}

        <View style={styles.flex} />
        <StepFooter step="4/5" href="/reporte/orgullo" variant="centered" backgroundColor="#f3f6fc" withNav={false} />
      </ScrollView>

      <BottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flexGrow: 1, minHeight: 32 },
  options: {
    marginTop: 46,
    paddingHorizontal: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 30,
    rowGap: 31,
  },
  option: {
    width: 150,
    flexGrow: 1,
    height: 43,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#aaaaaa',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.22)',
  },
  optionText: { ...fonts.poppins(), fontSize: 14, color: '#555555' },
  blueChecked: { backgroundColor: '#E4F2FB', borderColor: '#9FBACA' },
  purpleChecked: { backgroundColor: '#E8D9F2', borderColor: '#BCA6C8' },
  pressed: { transform: [{ scale: 0.97 }] },
  none: { width: 122, flexGrow: 0, alignSelf: 'center', marginTop: 31 },
});
