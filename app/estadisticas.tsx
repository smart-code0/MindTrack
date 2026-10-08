import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { AppHeader } from '@/components/AppHeader';
import { BackArea } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { IconName } from '@/constants/icons';
import { diagonal, fonts, horizontal } from '@/constants/theme';

const SUMMARY: { icon: IconName; value: string; label: string }[] = [
  { icon: 'material-symbols:calendar-month', value: '14', label: 'Recorded\ndays' },
  { icon: 'ph:smiley', value: 'Happy', label: 'Your current\nmood' },
  { icon: 'material-symbols:bolt', value: '6.4', label: 'Average\nenergy' },
];

const FILTERS = ['Week', 'Month', 'All'];

/** Puntos de la gráfica de ánimo, en el sistema de coordenadas 280×120 del SVG original. */
const MOOD_POINTS = [
  [5, 112],
  [48, 20],
  [95, 40],
  [137, 92],
  [177, 54],
  [225, 52],
  [270, 64],
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Alturas en px de las barras estrés / energía. */
const BARS = [
  { year: '2012', stress: 67, energy: 27 },
  { year: '2013', stress: 39, energy: 48 },
  { year: '2014', stress: 56, energy: 43 },
  { year: '2015', stress: 58, energy: 13 },
  { year: '2016', stress: 28, energy: 65 },
];

const STATS: { icon: IconName; bg: string; color: string; label: string; value: string }[] = [
  { icon: 'ph:smiley', bg: '#e8e0ff', color: '#806cff', label: 'Frequent emotion', value: 'Happy' },
  { icon: 'material-symbols:bar-chart', bg: '#d9ffe2', color: '#111111', label: 'Average stress', value: '4.2/10' },
  { icon: 'material-symbols:bed', bg: '#cfe3ff', color: '#5487df', label: 'Average sleep', value: '7.4 h' },
  { icon: 'material-symbols:local-fire-department', bg: '#ff9b9d', color: '#c33c42', label: 'Current streak', value: '12 days' },
];

const INSIGHTS: { icon: IconName; text: string }[] = [
  { icon: 'ph:smiley-sad', text: 'You tend to feel more stressed on Tuesdays. Try to plan relaxing activities for that day.' },
  { icon: 'ph:lightning', text: 'Your energy level has improved compared to last week. Keep up the good pace!' },
  { icon: 'ph:fire', text: "You've been tracking your emotions for 8 consecutive days. Excellent consistency!" },
  { icon: 'ph:smiley', text: 'Your emotional state has been stable this week. That is very positive.' },
];

/** Resumen emocional (estadisticas.html). Los datos son los mismos valores fijos del prototipo. */
export default function StatisticsScreen() {
  return (
    <Screen backgroundColor="#ffffff" outerColor="#eeeeee">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader iconColor="#000000" />

        <View style={styles.content}>
          <BackArea href="/home" />

          <Text style={styles.title}>Your emotional summary</Text>

          <View style={styles.summaryCards}>
            {SUMMARY.map((item) => (
              <LinearGradient key={item.value} colors={['#6d8eef', '#9b7ad0']} {...diagonal} style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name={item.icon} size={20} color="#ffffff" />
                </View>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </LinearGradient>
            ))}
          </View>

          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <Pressable key={f} style={styles.filter} role="button">
                <LinearGradient colors={['#5e82df', '#9277d1']} {...horizontal} style={styles.filterFill}>
                  <Text style={styles.filterText}>{f}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <View style={[styles.chartCard, styles.moodCard]}>
            <Text style={styles.chartTitle}>Mood</Text>
            <View style={styles.moodChart}>
              <View style={styles.yLabels}>
                {['9', '6', '3', '0'].map((l) => (
                  <Text key={l} style={styles.axisText}>
                    {l}
                  </Text>
                ))}
              </View>
              <View style={styles.moodGraph}>
                {(['0%', '33%', '66%', '100%'] as const).map((top) => (
                  <View key={top} style={[styles.gridLine, { top }]} />
                ))}
                <Svg viewBox="0 0 280 120" preserveAspectRatio="none" width="100%" height={120} style={styles.moodSvg}>
                  <Polyline
                    points={MOOD_POINTS.map((p) => p.join(',')).join(' ')}
                    fill="none"
                    stroke="#5B8DEF"
                    strokeWidth={2}
                  />
                  {MOOD_POINTS.map(([cx, cy]) => (
                    <Circle key={cx} cx={cx} cy={cy} r={2.5} fill="#5b8def" />
                  ))}
                </Svg>
                <View style={styles.xLabels}>
                  {DAYS.map((d) => (
                    <Text key={d} style={styles.axisText}>
                      {d}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.chartCard, styles.stressCard]}>
            <Text style={styles.chartTitle}>Stress vs. Energy</Text>
            <View style={styles.barChart}>
              <View style={styles.barYLabels}>
                {['120', '90', '60', '30', '0'].map((l) => (
                  <Text key={l} style={styles.axisText}>
                    {l}
                  </Text>
                ))}
              </View>
              <View style={styles.barsArea}>
                {(['0%', '25%', '50%', '75%'] as const).map((top) => (
                  <View key={top} style={[styles.barLine, { top }]} />
                ))}
                <View style={[styles.barLine, styles.barLineZero]} />
                {BARS.map((b) => (
                  <View key={b.year} style={styles.barGroup}>
                    <View style={styles.bars}>
                      <View style={[styles.bar, styles.stress, { height: b.stress }]} />
                      <View style={[styles.bar, styles.energy, { height: b.energy }]} />
                    </View>
                    <Text style={[styles.axisText, styles.year]}>{b.year}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, styles.stress]} />
                <Text style={styles.legendText}>stress</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, styles.energy]} />
                <Text style={styles.legendText}>Energy</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Mood during the last 30 days</Text>
          <View style={styles.statsList}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                  <Icon name={s.icon} size={21} color={s.color} />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.insightsTitle]}>Automated insights</Text>
          <View style={styles.insights}>
            {INSIGHTS.map((insight) => (
              <View key={insight.text} style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Icon name={insight.icon} size={22} color="#000000" />
                </View>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* La barra quedaba fija sobre el contenido (position: sticky). */}
      <BottomNav style={styles.nav} />
    </Screen>
  );
}

const text = fonts.arial();

const styles = StyleSheet.create({
  content: { backgroundColor: '#f3f6fc', paddingTop: 32, paddingHorizontal: 18, paddingBottom: 110 },
  title: { ...text, marginTop: 14, textAlign: 'center', fontSize: 18, color: '#5b7fee' },
  summaryCards: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 25 },
  summaryCard: {
    width: 95,
    height: 145,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.18)',
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  summaryValue: { ...text, fontSize: 14, color: '#ffffff' },
  summaryLabel: { ...text, fontSize: 9, lineHeight: 11.7, color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  filters: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 7, marginTop: 15 },
  filter: { width: 72, height: 31, borderRadius: 8, boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.2)' },
  filterFill: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  filterText: { ...text, fontSize: 14, color: '#ffffff' },
  chartCard: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    padding: 10,
    overflow: 'hidden',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.22)',
  },
  moodCard: { marginTop: 29 },
  stressCard: { marginTop: 48 },
  chartTitle: { ...text, fontSize: 13, color: '#333333' },
  axisText: { ...text, fontSize: 8, color: '#999999' },
  moodChart: { height: 145, marginTop: 10, flexDirection: 'row' },
  yLabels: { width: 25, height: 120, justifyContent: 'space-between', alignItems: 'flex-end' },
  moodGraph: { flex: 1, height: 125, marginLeft: 5 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#dfe3eb' },
  moodSvg: { position: 'absolute', left: 0, top: 0, overflow: 'visible' },
  xLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barChart: { height: 130, marginTop: 10, flexDirection: 'row' },
  barYLabels: { width: 27, height: 105, justifyContent: 'space-between', alignItems: 'flex-end' },
  barsArea: {
    flex: 1,
    height: 105,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#555555',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#e0e3e8' },
  barLineZero: { bottom: 0, backgroundColor: '#555555' },
  barGroup: { width: 30, height: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2 },
  bars: { height: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  stress: { backgroundColor: '#ec5c76' },
  energy: { backgroundColor: '#5b8def' },
  year: { position: 'absolute', bottom: -17, alignSelf: 'center' },
  legend: { flexDirection: 'row', gap: 12, marginTop: 7, marginLeft: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendCircle: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...text, fontSize: 9, color: '#999999' },
  sectionTitle: { ...text, marginTop: 42, fontSize: 15, color: '#111111' },
  insightsTitle: { marginTop: 40 },
  statsList: { marginTop: 31, alignItems: 'center', gap: 20 },
  statCard: {
    width: 184,
    height: 76,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.22)',
  },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  statText: { gap: 1 },
  statLabel: { ...text, fontSize: 10, color: '#555555' },
  statValue: { ...text, fontSize: 10, color: '#555555' },
  insights: { marginTop: 29, gap: 18 },
  insightCard: {
    minHeight: 61,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  insightIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  insightText: { flex: 1, ...text, fontSize: 9, lineHeight: 13, color: '#8588a1' },
  nav: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
