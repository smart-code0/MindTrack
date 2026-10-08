import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { GradientButton } from '@/components/GradientButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { IconName } from '@/constants/icons';
import { fonts, gradients, horizontal, vertical } from '@/constants/theme';

const MOODS: { icon: IconName; label: string }[] = [
  { icon: 'garden:face-very-happy-stroke-16', label: 'Happy' },
  { icon: 'garden:face-very-happy-stroke-12', label: 'Good' },
  { icon: 'garden:face-neutral-stroke-12', label: 'Neutral' },
  { icon: 'streamline:sad-face', label: 'Sad' },
  { icon: 'fa-regular:angry', label: 'Anxious' },
];

const STATS: { icon: IconName; iconSize: number; color: string; lineHeight: number; bg: [string, string]; value: string; label: string }[] = [
  { icon: 'material-symbols-light:vital-signs', iconSize: 22, color: '#5960DD', lineHeight: 29, bg: ['#eef5ff', '#ffffff'], value: '6/10', label: 'Stress level' },
  { icon: 'solar:moon-line-duotone', iconSize: 16, color: '#AE00F9', lineHeight: 25, bg: ['#f5ecff', '#ffffff'], value: '7h', label: 'Hours of sleep' },
  {
    icon: 'streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow',
    iconSize: 16,
    color: '#95D5B2',
    lineHeight: 25,
    bg: ['#efffed', '#ffffff'],
    value: '1km',
    label: 'Physical activity',
  },
];

/** Inicio (home.html). */
export default function HomeScreen() {
  return (
    <Screen backgroundColor="#EEF3FB">
      <AppHeader iconColor="#000000" iconOffsetY={7} />

      <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Hi, Williams!</Text>
          <Text style={styles.welcomeDate}>Tuesday, 24 February 2026</Text>
        </View>

        <View style={[styles.card, styles.moodCard]}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={styles.moods}>
            {MOODS.map((mood) => (
              <View key={mood.label} style={styles.moodItem}>
                <Icon name={mood.icon} size={26} color="rgba(125, 125, 125, 0.49)" />
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.register}>
            {'Last register: '}
            <Text style={styles.registerStrong}>Yesterday - Happy</Text>
          </Text>
          <Image source={require('@/img/grafico.png')} style={styles.chart} alt="grafica" />
        </View>

        <View style={styles.stats}>
          {STATS.map((s) => (
            <LinearGradient key={s.label} colors={s.bg} {...vertical} style={styles.box}>
              <View style={[styles.boxIcon, { height: s.lineHeight }]}>
                <Icon name={s.icon} size={s.iconSize} color={s.color} />
              </View>
              <Text style={styles.boxValue}>{s.value}</Text>
              <Text style={styles.boxLabel}>{s.label}</Text>
            </LinearGradient>
          ))}
        </View>

        <LinearGradient colors={['#E9DCF5', '#E8EFFD']} {...horizontal} style={styles.recommendation}>
          <Text style={styles.recommendationText}>
            <Text style={styles.recommendationStrong}>Personalized recommendation:</Text>
            {
              " Today seems like a good day for physical activity; we've noticed that it improves your mood, and it would be nice for you to take a break outdoors."
            }
          </Text>
        </LinearGradient>

        <View style={[styles.card, styles.appointmentCard]}>
          <View style={styles.appointmentTitleRow}>
            <View style={styles.calendarIcon}>
              <Icon name="fluent:calendar-48-regular" size={18} color="#7C94D9" />
            </View>
            <Text style={styles.appointmentTitle}> Next appointment</Text>
          </View>

          <View style={styles.appointmentInfo}>
            <LinearGradient colors={['#D6B0FF', '#CDDEFF']} {...horizontal} style={styles.avatar}>
              <Text style={styles.avatarText}>SB</Text>
            </LinearGradient>
            <View>
              <Text style={styles.doctor}>Dr. Samuel Bryson</Text>
              <Text style={styles.date}>22 of march - 4:30 pm</Text>
            </View>
            <Pressable style={styles.detailsButton} role="button">
              <Text style={styles.detailsText}>See details</Text>
            </Pressable>
          </View>
        </View>

        <GradientButton
          label="Log my full day"
          onPress={() => router.navigate('/reporte/emociones')}
          colors={gradients.primary}
          style={styles.mainButton}
          textStyle={styles.mainButtonText}
        />
      </ScrollView>

      <BottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  welcome: { alignItems: 'center', marginVertical: 18 },
  welcomeTitle: { ...fonts.poppins(500), fontSize: 32, color: '#000000' },
  welcomeDate: { ...fonts.poppins(), fontSize: 14, color: '#8b8b8b' },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    padding: 16,
    borderRadius: 18,
    boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.12)',
  },
  moodCard: { marginBottom: 15 },
  cardTitle: { ...fonts.poppins(300), fontSize: 18.72, color: '#000000' },
  moods: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  moodItem: {
    width: 58,
    height: 60,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: { ...fonts.poppins(), fontSize: 11, color: '#000000' },
  register: { ...fonts.poppins(300), fontSize: 16, color: '#666666', marginTop: 25 },
  registerStrong: { ...fonts.poppins(), color: '#000000' },
  chart: { width: 325, height: 325 * (266 / 1021), marginTop: 25, marginBottom: 7 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
  box: {
    width: '31%',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
  },
  boxIcon: { justifyContent: 'flex-end', paddingBottom: 7 },
  boxValue: { ...fonts.poppins(500), fontSize: 24, color: '#000000', marginBottom: 6 },
  boxLabel: { ...fonts.poppins(), fontSize: 12, color: '#777777', textAlign: 'center' },
  recommendation: { marginVertical: 18, marginHorizontal: 15, padding: 14, borderRadius: 14 },
  recommendationText: { ...fonts.poppins(), fontSize: 13, color: '#000000' },
  recommendationStrong: { ...fonts.poppins(700) },
  appointmentCard: { marginBottom: 15 },
  appointmentTitleRow: { flexDirection: 'row', alignItems: 'center' },
  calendarIcon: { width: 25, marginLeft: -3, marginRight: -3 },
  appointmentTitle: { ...fonts.poppins(500), fontSize: 15, color: '#000000' },
  appointmentInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { ...fonts.poppins(), fontSize: 16, color: '#ffffff' },
  doctor: { ...fonts.poppins(300), fontSize: 16, color: '#000000' },
  date: { ...fonts.poppins(), fontSize: 10, color: '#7D7D7D' },
  detailsButton: {
    marginLeft: 'auto',
    backgroundColor: '#7C94D9',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  detailsText: { ...fonts.poppins(), fontSize: 13.33, color: '#ffffff' },
  mainButton: {
    height: 66,
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 15,
    borderRadius: 16,
    boxShadow: '0px 4px 4px #c7c7c7',
  },
  mainButtonText: { ...fonts.poppins(300), fontSize: 20, color: '#ffffff' },
});
