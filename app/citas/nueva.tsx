import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackArea } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Dropdown } from '@/components/Dropdown';
import { GradientButton } from '@/components/GradientButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { IconName } from '@/constants/icons';
import { fonts, gradients } from '@/constants/theme';
import { addAppointment } from '@/services/appointments';
import { AppointmentType } from '@/types/appointment';

const TYPES: { type: AppointmentType; icon: IconName }[] = [
  { type: 'Psychologist', icon: 'mdi:brain' },
  { type: 'Psychiatrist', icon: 'mdi:stethoscope' },
  { type: 'Doctor', icon: 'mdi:doctor' },
  { type: 'Exercise', icon: 'mdi:dumbbell' },
  { type: 'Tracing', icon: 'mdi:clipboard-list' },
  { type: 'Other', icon: 'mdi:calendar-plus' },
];

const DOCTORS = ['Dr. Samuel Bryson', 'Dr. Amelia Carter', 'Dr. Lucas Bennett'];

const BLUE = '#4f70ff';

/** Campo de texto con el borde y la sombra de foco del formulario original. */
function Field(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor="#a3aac8"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.input, focused && styles.inputFocused]}
    />
  );
}

/** Nueva cita (agendar-cita2.html). */
export default function NewAppointmentScreen() {
  const [type, setType] = useState<AppointmentType>('Psychologist');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [place, setPlace] = useState('');
  const [reminder, setReminder] = useState(true);

  const create = async () => {
    // Los campos vacíos toman el valor de ejemplo, igual que en el prototipo.
    await addAppointment({
      type,
      date: date || '30/06/2026',
      startTime: startTime || '10:00 a.m.',
      place: place || 'Office 204',
      reminder,
      doctor,
    });
    router.dismissTo('/citas');
  };

  return (
    <Screen backgroundColor="#f8f9ff">
      <AppHeader />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackArea href="/citas" />

        <View style={styles.welcome}>
          <Text style={styles.title}>New citation</Text>
          <Text style={styles.subtitle}>Fill in the appointment details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.typeSection}>
            <Text style={styles.sectionTitle}>Appointment type</Text>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => {
                const active = t.type === type;
                return (
                  <Pressable
                    key={t.type}
                    onPress={() => setType(t.type)}
                    style={[styles.typeButton, active && styles.typeButtonActive]}
                    role="radio"
                    aria-selected={active}
                  >
                    <View style={[styles.typeIcon, active && styles.typeIconActive]}>
                      <Icon name={t.icon} size={22} color={BLUE} />
                    </View>
                    <Text style={[styles.typeText, active && styles.typeTextActive]}>{t.type}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.flex]}>
                <Text style={styles.label}>Date *</Text>
                <Field placeholder="30/06/2026" value={date} onChangeText={setDate} />
              </View>
              <View style={[styles.inputGroup, styles.flex]}>
                <Text style={styles.label}>Start time</Text>
                <Field placeholder="10:00 a.m." value={startTime} onChangeText={setStartTime} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available doctor</Text>
              <Dropdown
                value={doctor}
                options={DOCTORS}
                onChange={setDoctor}
                style={[styles.input, styles.select]}
                textStyle={styles.selectText}
                arrowColor={BLUE}
                label="Available doctor"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Place</Text>
              <Field placeholder="Office 204" value={place} onChangeText={setPlace} />
            </View>

            <View style={styles.reminder}>
              <View style={styles.reminderLabels}>
                <Text style={styles.reminderTitle}>Activate reminder</Text>
                <Text style={styles.reminderText}>Get notified before the appointment</Text>
              </View>
              <ToggleSwitch
                value={reminder}
                onValueChange={setReminder}
                width={45}
                height={26}
                knobSize={22}
                inset={2}
                offColor="#d9dcff"
                onColor="#7e84ff"
                knobShadow="0px 6px 16px rgba(15, 23, 42, 0.12)"
                duration={200}
                travel={20}
              />
            </View>

            <GradientButton
              label="Create appointment"
              onPress={create}
              colors={gradients.primary}
              style={styles.submit}
              textStyle={styles.submitText}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav activeIndex={2} calendarHref="/citas/nueva" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 18, paddingHorizontal: 20 },
  welcome: { marginBottom: 14 },
  title: { ...fonts.poppins(700), fontSize: 24, color: '#14142b', marginBottom: 6 },
  subtitle: { ...fonts.poppins(), fontSize: 14, color: '#6c728f' },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6eafb',
    borderRadius: 22,
    padding: 20,
    boxShadow: '0px 12px 28px rgba(52, 70, 130, 0.1)',
  },
  typeSection: { marginBottom: 20 },
  sectionTitle: { ...fonts.poppins(600), fontSize: 13, color: '#3e4c82', marginBottom: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeButton: {
    width: '30.7%',
    flexGrow: 1,
    backgroundColor: '#f5f7ff',
    borderWidth: 1,
    borderColor: '#e5e9f8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
  },
  typeButtonActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
    boxShadow: '0px 6px 14px rgba(79, 112, 255, 0.24)',
  },
  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconActive: { backgroundColor: '#ffffff' },
  typeText: { ...fonts.arial(true), fontSize: 11, color: '#22233f', textAlign: 'center' },
  typeTextActive: { color: '#ffffff' },
  form: { gap: 16 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 8 },
  label: { ...fonts.poppins(600), fontSize: 12, color: '#6f7287' },
  input: {
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ecfb',
    backgroundColor: '#fbfbff',
    paddingHorizontal: 16,
    ...fonts.arial(),
    fontSize: 14,
    color: '#14142b',
  },
  inputFocused: { borderColor: BLUE, boxShadow: '0px 0px 0px 3px rgba(79, 112, 255, 0.12)' },
  select: { justifyContent: 'center' },
  selectText: { ...fonts.arial(), fontSize: 14, color: '#14142b' },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#f5f6ff',
    borderWidth: 1,
    borderColor: '#e7e9fb',
  },
  reminderLabels: { flex: 1, gap: 4 },
  reminderTitle: { ...fonts.poppins(700), fontSize: 14, color: '#1c1f41' },
  reminderText: { ...fonts.poppins(), fontSize: 12, color: '#6f7287' },
  submit: { height: 50, marginTop: 10, borderRadius: 20 },
  submitText: { ...fonts.arial(true), fontSize: 16, color: '#ffffff' },
});
