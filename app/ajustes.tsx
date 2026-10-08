import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fragment, ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { IconName } from '@/constants/icons';
import { diagonal, fonts } from '@/constants/theme';

type Row = {
  icon: IconName;
  iconSize: number;
  iconColor?: string;
  bg: string;
  title: string;
  subtitle?: string;
  /** Contenido a la derecha; por defecto, la flecha chevron. */
  right?: ReactNode;
};

/** Perfil y ajustes (settings.html). */
export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'ACCOUNT',
      rows: [
        { icon: 'fa-regular:user', iconSize: 16, bg: '#cfa8ff', title: 'Edit profile', subtitle: 'will@gmail.com' },
        {
          icon: 'fa-regular:bell',
          iconSize: 16,
          bg: '#ffbf80',
          title: 'Notifications',
          subtitle: 'Manage reminders',
          right: (
            <ToggleSwitch
              value={notifications}
              onValueChange={setNotifications}
              width={45}
              height={24}
              knobSize={18}
              inset={3}
              offColor="#cccccc"
              onColor="#4c7df3"
              duration={300}
            />
          ),
        },
      ],
    },
    {
      title: 'DATA',
      rows: [
        { icon: 'mi:document', iconSize: 22, iconColor: '#52b890', bg: '#B8F3DF', title: 'Export history', subtitle: 'Download PDF' },
        { icon: 'fa-solid:shield-halved', iconSize: 16, bg: '#aa8cff', title: 'Privacy and security' },
      ],
    },
    {
      title: 'SUPPORT',
      rows: [{ icon: 'fa-regular:circle-question', iconSize: 16, bg: '#87b7ff', title: 'Help Center' }],
    },
  ];

  const logOut = () => {
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  return (
    <Screen backgroundColor="#eef0ff" outerColor="#f5f5f5" bottomInset>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#5c82f5', '#9b6de4']} {...diagonal} style={styles.header}>
          <View style={styles.arrow}>
            <BackButton href="/home" size={25} color="#ffffff" />
          </View>
          <LinearGradient colors={['#D6B0FF', '#CDDEFF']} {...diagonal} style={styles.avatar}>
            <Text style={styles.avatarText}>WV</Text>
          </LinearGradient>
          <Text style={styles.name}>Williams Vanegas</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Carer</Text>
          </View>
          <Text style={styles.member}>member since June 26</Text>
        </LinearGradient>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Recorded days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6.3</Text>
            <Text style={styles.statLabel}>Average energy</Text>
          </View>
        </View>

        <View style={styles.content}>
          {sections.map((section) => (
            <Fragment key={section.title}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.card}>
                {section.rows.map((row, i) => (
                  <Fragment key={row.title}>
                    {i > 0 && <View style={styles.hr} />}
                    <View style={styles.row}>
                      <View style={styles.left}>
                        <View style={[styles.icon, { backgroundColor: row.bg }]}>
                          <Icon name={row.icon} size={row.iconSize} color={row.iconColor ?? '#ffffff'} />
                        </View>
                        <View>
                          <Text style={styles.rowTitle}>{row.title}</Text>
                          {row.subtitle && <Text style={styles.rowSubtitle}>{row.subtitle}</Text>}
                        </View>
                      </View>
                      {row.right ?? <Icon name="fa-solid:chevron-right" size={16} color="#000000" />}
                    </View>
                  </Fragment>
                ))}
              </View>
            </Fragment>
          ))}

          <Pressable style={styles.logout} onPress={logOut} role="button">
            <Icon name="fa-solid:arrow-right-from-bracket" size={15} color="#ff3a3a" />
            <Text style={styles.logoutText}> LOG OUT</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, paddingBottom: 90 },
  arrow: { alignSelf: 'flex-start', width: 34, height: 34, alignItems: 'center', paddingTop: 1.5 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...fonts.arial(true), fontSize: 30, color: '#ffffff' },
  name: { ...fonts.arial(true), fontSize: 22, color: '#ffffff', marginTop: 12 },
  badge: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: { ...fonts.arial(), fontSize: 13, color: '#ffffff' },
  member: { ...fonts.arial(), fontSize: 14, color: '#ffffff', marginTop: 12, opacity: 0.9 },
  stats: {
    width: 290,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 18,
    marginTop: -45,
    marginBottom: 20,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)',
    zIndex: 10,
  },
  statItem: { alignItems: 'center' },
  statValue: { ...fonts.arial(), fontSize: 22, color: '#5d74ff' },
  statLabel: { ...fonts.arial(), fontSize: 13, color: '#666666' },
  statDivider: { width: 1, height: 50, backgroundColor: '#dddddd' },
  content: { padding: 25 },
  sectionTitle: {
    ...fonts.arial(true),
    fontSize: 13,
    color: '#999999',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 12,
  },
  card: { backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { ...fonts.arial(true), fontSize: 15, color: '#000000' },
  rowSubtitle: { ...fonts.arial(), fontSize: 13.33, lineHeight: 18, color: '#999999' },
  hr: { height: 1, backgroundColor: '#eeeeee' },
  logout: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffd6d6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { ...fonts.arial(true), fontSize: 15, color: '#ff3a3a' },
});
