import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GradientButton } from '@/components/GradientButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { fonts } from '@/constants/theme';

/** Alto de la pantalla bajo la barra de estado en el diseño original (844 − 45). */
const DESIGN_HEIGHT = 799;

/** Recuperar contraseña (recuperar.html). El envío aún no está implementado. */
export default function RecoverScreen() {
  const [focused, setFocused] = useState(false);

  return (
    <Screen backgroundColor="#edf1ff" outerColor="#eeeeF8" bottomInset>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={styles.hero}>
          <Image source={require('@/img/MindTrack-Logo.png')} style={styles.logo} accessibilityLabel="MindTrack" />
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.text}>{"Enter your email and we'll send you\na link to reset your password."}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
            <View style={styles.inputIcon}>
              <Icon name="fa-regular:envelope" size={20} color="#8aa0e6" />
            </View>
            <TextInput
              placeholder="youremail@gmail.com"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={styles.input}
            />
          </View>

          <GradientButton
            colors={['#5f8df5', '#9772d9']}
            style={styles.send}
            contentStyle={styles.sendContent}
            textStyle={styles.sendText}
            label="Send reset link"
          >
            <Icon name="fa-regular:paper-plane" size={17} color="#ffffff" />
          </GradientButton>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.lockCircle}>
              <Icon name="fa-solid:lock" size={21} color="#5f8df5" />
            </View>
            <Text style={styles.infoText}>
              We'll send a secure link to your email to help you create a new password.
            </Text>
          </View>

          <Pressable style={styles.back} onPress={() => router.navigate('/')} accessibilityRole="link">
            <Icon name="fa-solid:arrow-left" size={17} color="#5f8df5" style={styles.backIcon} />
            <Text style={styles.backText}>Back to login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // En pantallas bajas se desplaza en lugar de tapar el título con la tarjeta.
  scroll: { flexGrow: 1, minHeight: DESIGN_HEIGHT },
  hero: { height: 355, alignItems: 'center', paddingTop: 42 },
  logo: { width: 175, height: 175 * (113 / 386), marginBottom: 27 },
  title: { ...fonts.arial(), fontSize: 23, lineHeight: 30, color: '#172b85', marginBottom: 12, textAlign: 'center' },
  text: { ...fonts.arial(), fontSize: 14, lineHeight: 23, color: '#929292', textAlign: 'center' },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 500,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 42,
    paddingHorizontal: 25,
    paddingBottom: 30,
    boxShadow: '0px -5px 20px rgba(0, 0, 0, 0.07)',
  },
  label: { ...fonts.arial(), fontSize: 14, color: '#333333', marginBottom: 10 },
  inputBox: {
    height: 55,
    backgroundColor: '#f0f0f8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputBoxFocused: { borderColor: '#8aa0e6', backgroundColor: '#f4f5ff' },
  inputIcon: { width: 20 },
  input: { flex: 1, height: '100%', padding: 0, marginLeft: 15, ...fonts.arial(), fontSize: 14, color: '#555555' },
  send: { height: 55, borderRadius: 12, boxShadow: '0px 8px 18px rgba(70, 80, 130, 0.2)' },
  sendContent: { flexDirection: 'row', gap: 12 },
  sendText: { ...fonts.arial(), fontSize: 16, color: '#ffffff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 35, marginBottom: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#dddddd' },
  dividerText: { ...fonts.arial(), fontSize: 13, color: '#999999' },
  infoBox: {
    minHeight: 100,
    backgroundColor: '#f0f4ff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  lockCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dce7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoText: { flex: 1, ...fonts.arial(), fontSize: 12, lineHeight: 20, color: '#555d78' },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  backIcon: { marginRight: 10 },
  backText: { ...fonts.arial(), fontSize: 14, color: '#5f8df5' },
});
