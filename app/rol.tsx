import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GradientButton } from '@/components/GradientButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { IconName } from '@/constants/icons';
import { fonts, images, LOGO_RATIO } from '@/constants/theme';

const ROLES: { icon: IconName; title: string; text: string; selected?: boolean }[] = [
  {
    icon: 'mdi:account-heart',
    title: 'Patient',
    text: 'Customize your MindTrack experience based on how you plan to use it.',
    selected: true,
  },
  {
    icon: 'mdi:doctor',
    title: 'Psychologist/therapist',
    text: "I want to monitor my patients' progress and manage appointments.",
  },
];

/** Elegir rol (loginrol.html). Las tarjetas son estáticas, como en el original. */
export default function RoleScreen() {
  return (
    <Screen backgroundColor="#EEF3FF" outerColor="#ECECEC" bottomInset>
      <View style={styles.header}>
        <Image source={images.logo} style={styles.logo} alt="MindTrack" />
      </View>

      <ScrollView contentContainerStyle={styles.main} bounces={false}>
        <Text style={styles.title}>What is your role?</Text>
        <Text style={styles.subtitle}>{'Customize your MindTrack experience\nbased on how you plan to use it.'}</Text>

        {ROLES.map((role) => (
          <View key={role.title} style={[styles.card, role.selected && styles.cardSelected]}>
            <View style={styles.iconBox}>
              <Icon name={role.icon} size={22} color={role.selected ? '#4F73FF' : '#7A73D8'} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.cardTitle, role.selected && styles.cardTitleSelected]}>{role.title}</Text>
              <Text style={styles.cardText}>{role.text}</Text>
            </View>
          </View>
        ))}

        <GradientButton
          label="Continue"
          onPress={() => router.navigate('/home')}
          colors={['#5F92FF', '#9B77DA']}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 82, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 125, height: 125 / LOGO_RATIO },
  main: { alignItems: 'center', paddingTop: 24, paddingBottom: 24 },
  title: { ...fonts.poppins(600), fontSize: 20, color: '#243A9F', marginBottom: 10 },
  subtitle: {
    ...fonts.poppins(),
    fontSize: 15,
    lineHeight: 21.75,
    color: '#9A9A9A',
    textAlign: 'center',
    marginBottom: 55,
  },
  card: {
    width: 325,
    height: 84,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 26,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: '#5F8FFF',
    backgroundColor: '#F7F9FF',
    boxShadow: '0px 6px 16px rgba(95, 143, 255, 0.15)',
  },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  info: { flex: 1 },
  cardTitle: { ...fonts.poppins(500), fontSize: 15, color: '#6A43B8', marginBottom: 8 },
  cardTitleSelected: { ...fonts.poppins(600), color: '#4F73FF' },
  cardText: { ...fonts.poppins(), fontSize: 11, lineHeight: 13.75, color: '#444444' },
  button: {
    width: 272,
    height: 44,
    marginTop: 118,
    borderRadius: 10,
    boxShadow: '0px 5px 12px rgba(95, 146, 255, 0.3)',
  },
  buttonText: { ...fonts.poppins(), fontSize: 18, color: '#ffffff' },
});
