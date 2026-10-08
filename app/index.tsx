import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/AuthInput';
import { GradientButton } from '@/components/GradientButton';
import { Screen } from '@/components/Screen';
import { authStyles } from '@/constants/authStyles';
import { fonts, gradients, images } from '@/constants/theme';

/** Iniciar sesión (index.html). */
export default function LoginScreen() {
  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#e8e6ee" bottomInset>
      <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={authStyles.hero}>
          <View style={[authStyles.logoWrap, styles.logoWrap]}>
            <Image source={images.logo} style={authStyles.logo} alt="MindTrack" />
          </View>
          <Text style={authStyles.heroTitle}>Welcome Back!</Text>
          <Text style={authStyles.heroSubtitle}>{'Continue your journey towards\nemotional well-being'}</Text>
        </View>

        <View style={authStyles.formCard}>
          <Text style={authStyles.label}>Email</Text>
          <AuthInput
            icon="fa-regular:envelope"
            placeholder="youremail@gmail.com"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />

          <Text style={authStyles.label}>Password</Text>
          <AuthInput icon="fa-solid:lock" placeholder="**********" password="solar" autoComplete="password" />

          <Pressable onPress={() => router.navigate('/recuperar')} role="link">
            <Text style={styles.forgot}>Forgot your password?</Text>
          </Pressable>

          <GradientButton
            label="Login"
            onPress={() => router.navigate('/home')}
            colors={gradients.primary}
            locations={[0, 0.37, 0.9]}
            style={authStyles.primaryButton}
            textStyle={authStyles.primaryButtonText}
          />

          <Text style={styles.divider}>{'or  continue with'}</Text>

          <Pressable style={styles.google} role="button">
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>

          <Text style={styles.signupHint}>
            {"Don't have an account? "}
            <Text style={styles.signupLink} onPress={() => router.navigate('/registro')} role="link">
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // El login tenía un <br> antes del logo (una línea de 18 px).
  logoWrap: { paddingTop: 18 },
  forgot: { ...fonts.arial(), fontSize: 13, color: '#7aa1f4', textAlign: 'right', marginTop: 10 },
  divider: { ...fonts.arial(), fontSize: 13, color: '#8b99c8', textAlign: 'center', marginVertical: 22 },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ececf3',
    backgroundColor: '#f8f8fb',
    boxShadow: '2px 5px 5px #c7c7c7',
  },
  // La imagen ocupaba una caja de línea de 23 px dentro del botón.
  googleIcon: { width: 20, height: 20, marginVertical: 1.5 },
  googleText: { ...fonts.arial(), fontSize: 14, color: '#26263a' },
  signupHint: {
    ...fonts.arial(),
    marginTop: 'auto',
    paddingTop: 40,
    fontSize: 13,
    color: '#8b99c8',
    textAlign: 'center',
  },
  signupLink: { color: '#5B8DEF' },
});
