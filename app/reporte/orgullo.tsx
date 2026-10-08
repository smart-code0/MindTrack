import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icon';
import { RangeSlider } from '@/components/RangeSlider';
import { Screen } from '@/components/Screen';
import { StepFooter } from '@/components/StepFooter';
import { fonts } from '@/constants/theme';
import { reportStyles } from '@/constants/reportStyles';

const MAX_LENGTH = 100;

/** Registro diario 5/5: de qué te sientes orgulloso (Reporte05.html). */
export default function ProudScreen() {
  const [text, setText] = useState('');

  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#eeeeee">
      <AppHeader iconColor="#000000" />

      <ScrollView
        style={reportStyles.flex}
        contentContainerStyle={reportStyles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <BackButton href="/reporte/afrontamiento" color="#333333" style={reportStyles.backAlt} />
        <Text style={reportStyles.question}>Before you finish...</Text>
        <Text style={reportStyles.questionHint}>What is one thing you are proud of today?</Text>

        <View style={styles.textareaBox}>
          <TextInput
            multiline
            maxLength={MAX_LENGTH}
            value={text}
            onChangeText={setText}
            placeholder="i feel proud of make new friends today in the library..."
            placeholderTextColor="#b7b7b7"
            textAlignVertical="top"
            style={styles.textarea}
          />
          <View style={styles.textareaBottom} pointerEvents="box-none">
            <Text style={styles.count}>
              {text.length}/{MAX_LENGTH}
            </Text>
            <Pressable style={styles.mic} role="button" aria-label="Dictar por voz">
              <Icon name="solar:microphone-outline" size={14} color="#333333" />
            </Pressable>
          </View>
        </View>

        <View style={styles.hope}>
          <Text style={styles.hopeQuestion}>How hopeful do you feel about tomorrow?</Text>
          <View style={styles.slider}>
            <RangeSlider
              defaultValue={0}
              height={25}
              trackTop={13}
              trackHeight={5}
              trackColor="#d5d9e0"
              trackRadius={10}
              thumbWidth={35}
              thumbHeight={23}
              thumbRadius={12}
              thumbShadow="0px 2px 5px rgba(0, 0, 0, 0.2)"
              thumbOffset={-9}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Low</Text>
            <Text style={styles.sliderLabel}>High</Text>
          </View>
        </View>

        <View style={styles.spacer} />
        <StepFooter step="5/5" label="Finish" href="/reporte/completado" variant="centered" backgroundColor="#f3f6fc" withNav={false} />
      </ScrollView>

      <BottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textareaBox: {
    width: 312,
    alignSelf: 'center',
    height: 118,
    marginTop: 43,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    overflow: 'hidden',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
  },
  textarea: {
    flex: 1,
    paddingTop: 11,
    paddingHorizontal: 14,
    paddingBottom: 28,
    ...fonts.arial(),
    fontSize: 11,
    lineHeight: 16,
    color: '#444444',
  },
  textareaBottom: {
    position: 'absolute',
    left: 14,
    right: 10,
    bottom: 6,
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: { ...fonts.poppins(), fontSize: 10, color: '#333333' },
  mic: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  hope: { width: 280, alignSelf: 'center', marginTop: 96 },
  hopeQuestion: { ...fonts.poppins(), fontSize: 14, lineHeight: 18, color: '#333333', textAlign: 'center' },
  slider: { marginTop: 58 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  sliderLabel: { ...fonts.poppins(), fontSize: 12, color: '#333333' },
  spacer: { flexGrow: 1, minHeight: 80 },
});
