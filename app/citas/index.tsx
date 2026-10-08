import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { fonts, vertical } from '@/constants/theme';
import { formatDateLabel, getAppointments, removeAppointment } from '@/services/appointments';
import { Appointment } from '@/types/appointment';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type Day = { n: number; state?: 'empty' | 'selected' | 'marked' };

/** Calendario estático de julio de 2026, tal como estaba en el prototipo. */
const WEEKS: Day[][] = [
  [28, 29, 30, 1, 2, 3, 4].map((n) => ({ n, state: 'empty' })),
  [
    ...[5, 6, 7, 8].map((n): Day => ({ n, state: 'empty' })),
    { n: 9, state: 'selected' },
    { n: 10 },
    { n: 11 },
  ],
  [{ n: 12 }, { n: 13, state: 'marked' }, ...[14, 15, 16, 17, 18].map((n) => ({ n }))],
  [19, 20, 21, 22, 23, 24, 25].map((n) => ({ n })),
  [...[26, 27, 28, 29, 30, 31].map((n) => ({ n })), { n: 1, state: 'empty' }],
];

/** Agendar cita (agendar-cita.html): calendario y lista de citas guardadas. */
export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAppointments().then(setAppointments);
    }, []),
  );

  const remove = async (index: number) => setAppointments(await removeAppointment(index));

  const latest = appointments[appointments.length - 1];

  return (
    <Screen backgroundColor="#f7f9ff">
      <AppHeader />

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.backArea}>
          <BackButton href="/home" size={21} color="#333333" style={styles.back} />
        </View>

        <View style={styles.pageHeader}>
          <Text style={styles.title}>Schedule an appointment</Text>
          <Text style={styles.subtitle}>Choose the day</Text>
        </View>

        <View style={[styles.card, styles.calendarCard]}>
          <View style={styles.calendarHeader}>
            <Pressable style={styles.navButton} role="button" aria-label="Mes anterior">
              <Icon name="material-symbols:chevron-left" size={13.33} color="#344054" />
            </Pressable>
            <Text style={styles.month}>July 2026</Text>
            <Pressable style={styles.navButton} role="button" aria-label="Mes siguiente">
              <Icon name="material-symbols:chevron-right" size={13.33} color="#344054" />
            </Pressable>
          </View>

          <View style={styles.grid}>
            <View style={styles.week}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={[styles.cell, styles.weekday]}>
                  {d}
                </Text>
              ))}
            </View>
            {WEEKS.map((week, w) => (
              <View key={w} style={styles.week}>
                {week.map((day, i) => (
                  <View key={i} style={[styles.cell, styles.day, day.state && DAY_STATE[day.state].cell]}>
                    <Text style={[styles.dayText, day.state && DAY_STATE[day.state].text]}>{day.n}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>{latest ? formatDateLabel(latest.date) : 'No appointments yet'}</Text>

        <View style={styles.card}>
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['rgba(79, 112, 255, 0.18)', 'rgba(79, 112, 255, 0.08)']}
                {...vertical}
                style={styles.emptyIcon}
              >
                <Icon name="fa6-solid:calendar-days" size={32} color="#3d5bff" />
              </LinearGradient>
              <Text style={styles.emptyText}>There are no appointments today.</Text>
              <Text style={styles.addLink} onPress={() => router.navigate('/citas/nueva')} role="link">
                + Add citation
              </Text>
            </View>
          ) : (
            appointments.map((item, index) => (
              <View key={index} style={styles.appointment}>
                <View style={styles.appointmentTop}>
                  <View>
                    <Text style={styles.appointmentTitle}>Session with {item.type}</Text>
                    <Text style={styles.appointmentSubtitle}>{item.reminder ? 'Active reminder' : 'Reminder off'}</Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable style={[styles.action, styles.actionEdit]} role="button" aria-label="Editar">
                      <Icon name="ic:round-edit" size={14} color="#31aa7b" />
                    </Pressable>
                    <Pressable
                      style={[styles.action, styles.actionDelete]}
                      onPress={() => remove(index)}
                      role="button"
                      aria-label="Eliminar"
                    >
                      <Icon name="ic:round-close" size={14} color="#ed7188" />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    {/* El icono de reloj del original (material-symbols:watch-later) no existe en Iconify y no se mostraba. */}
                    <View />
                    <Text style={styles.infoText}>{item.startTime}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="mdi:account" size={14} color="#8d98b4" />
                    <Text style={styles.infoText}>{item.doctor}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="mdi:map-marker" size={14} color="#8d98b4" />
                    <Text style={styles.infoText}>{item.place}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </Screen>
  );
}

const text = fonts.arial();
const bold = fonts.arial(true);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 },
  backArea: { height: 20 },
  back: { position: 'absolute', left: 3, top: 0 },
  pageHeader: { alignItems: 'center', marginBottom: 20 },
  title: { ...bold, fontSize: 22, letterSpacing: -0.44, color: '#14142b', marginBottom: 8 },
  subtitle: { ...text, fontSize: 14, color: '#6d6f86' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    boxShadow: '0px 16px 40px rgba(15, 23, 42, 0.08)',
  },
  calendarCard: { padding: 20 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8ebf7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { ...bold, fontSize: 15, color: '#14142b' },
  grid: { gap: 12 },
  week: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1, textAlign: 'center' },
  weekday: { ...bold, fontSize: 13, color: '#7b7f9e' },
  day: { aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayText: { ...text, fontSize: 13, color: '#14142b' },
  dayEmptyText: { color: '#c9cbd6' },
  daySelected: { backgroundColor: '#4f70ff', boxShadow: '0px 12px 24px rgba(79, 112, 255, 0.18)' },
  daySelectedText: { color: '#ffffff' },
  dayMarked: { backgroundColor: '#eef3ff' },
  dayMarkedText: { ...bold, color: '#2f3c83' },
  emptyText: { ...text, fontSize: 14, lineHeight: 22.4, color: '#5f668b', textAlign: 'center' },
  sectionLabel: { ...bold, fontSize: 14, color: '#394051', marginBottom: 14 },
  emptyState: { alignItems: 'center', gap: 18 },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  addLink: { ...bold, fontSize: 14, color: '#4f70ff' },
  appointment: {
    marginTop: 16,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#edf0f8',
    borderLeftWidth: 3,
    borderLeftColor: '#4f70ff',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    gap: 14,
    boxShadow: '0px 8px 22px rgba(35, 49, 95, 0.08)',
  },
  appointmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  appointmentTitle: { ...bold, fontSize: 13, color: '#14142b' },
  appointmentSubtitle: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#edf9f4',
    overflow: 'hidden',
    ...bold,
    fontSize: 10,
    color: '#35a477',
  },
  actions: { flexDirection: 'row', gap: 6 },
  action: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionEdit: { backgroundColor: '#eaf8f2' },
  actionDelete: { backgroundColor: '#fff0f3' },
  infoRow: { gap: 8, paddingTop: 2 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { ...text, fontSize: 11, color: '#5f667d' },
});

const DAY_STATE = {
  empty: { cell: undefined, text: styles.dayEmptyText },
  selected: { cell: styles.daySelected, text: styles.daySelectedText },
  marked: { cell: styles.dayMarked, text: styles.dayMarkedText },
};
