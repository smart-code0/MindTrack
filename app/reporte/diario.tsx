import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { StepFooter } from '@/components/StepFooter';
import { fonts } from '@/constants/theme';

const MAX_LENGTH = 300;

/** Registro diario 3/5: qué pasó hoy (Reporte03.html). */
export default function JournalScreen() {
  const [text, setText] = useState('');

  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#e8e6ee">
      <AppHeader />

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
        <BackButton href="/reporte/intensidad" style={styles.back} />
        <Text style={styles.title}>Tell us more</Text>
        <Text style={styles.subtitle}>What happened today?</Text>

        <View style={styles.box}>
          <TextInput
            multiline
            maxLength={MAX_LENGTH}
            value={text}
            onChangeText={setText}
            placeholder="Today I felt more relaxed because I spent time with my family..."
            placeholderTextColor="#757575"
            textAlignVertical="top"
            style={styles.textarea}
          />
          <View style={styles.boxFooter}>
            <Text style={styles.count}>
              {text.length}/{MAX_LENGTH}
            </Text>
            <Pressable style={styles.mic} role="button" aria-label="Dictar por voz">
              <Icon name="material-symbols-light:mic" size={16} color="#000000" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <StepFooter step="3/5" href="/reporte/afrontamiento" variant="stacked" arialStep />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 18, paddingHorizontal: 26, paddingBottom: 24 },
  back: { position: 'absolute', top: 24, left: 15, zIndex: 10 },
  title: { ...fonts.arial(), fontSize: 21, color: '#1a1a3d', textAlign: 'center', marginTop: 6 },
  subtitle: { ...fonts.arial(), fontSize: 14, color: '#8b8b9c', textAlign: 'center', marginTop: 5, marginBottom: 26 },
  box: {
    minHeight: 230,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  textarea: { flex: 1, padding: 0, ...fonts.arial(), fontSize: 14, lineHeight: 21, color: '#1c1c28' },
  boxFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, height: 20 },
  count: { ...fonts.arial(), fontSize: 12, color: '#a9a9ba' },
  mic: { height: 20, justifyContent: 'center' },
});
