import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/AuthInput';
import { GradientButton } from '@/components/GradientButton';
import { Screen } from '@/components/Screen';
import { authStyles } from '@/constants/authStyles';
import { fonts, gradients, images } from '@/constants/theme';

/** Crear cuenta (registro.html). */
export default function RegisterScreen() {
  return (
    <Screen backgroundColor="#EEF3FB" outerColor="#e8e6ee" bottomInset>
      <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={authStyles.hero}>
          <View style={authStyles.logoWrap}>
            <Image source={images.logo} style={authStyles.logo} alt="MindTrack" />
          </View>
          <Text style={authStyles.heroTitle}>Create your account</Text>
          <Text style={authStyles.heroSubtitle}>{'Begin your journey towards\nemotional well-being'}</Text>
        </View>

        <View style={authStyles.formCard}>
          <Text style={authStyles.label}>Full name</Text>
          <AuthInput icon="solar:user-outline" iconBoxHeight={25} placeholder="Your name" autoComplete="name" />

          <Text style={authStyles.label}>Email</Text>
          <AuthInput
            icon="fa-regular:envelope"
            placeholder="youremail@gmail.com"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />

          <Text style={authStyles.label}>Password</Text>
          <AuthInput icon="fa-solid:lock" placeholder="**********" password="fa" autoComplete="new-password" />

          <Text style={authStyles.label}>Confirm your password</Text>
          <AuthInput icon="fa-solid:lock" placeholder="**********" password="fa" autoComplete="new-password" />

          <Text style={styles.terms}>By confirming, you accept our Terms of Service and Privacy Policy.</Text>

          {/* El botón quedaba anclado al final de la tarjeta (margin-top: auto, mínimo 22 px). */}
          <View style={styles.spacer} />

          <GradientButton
            label="Create account"
            onPress={() => router.navigate('/rol')}
            colors={gradients.primary}
            locations={[0, 0.37, 0.9]}
            style={[authStyles.primaryButton, styles.button]}
            textStyle={authStyles.primaryButtonText}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  terms: { ...fonts.arial(), fontSize: 12, lineHeight: 18, color: '#9494a6', marginTop: 10 },
  spacer: { flexGrow: 1, minHeight: 22 },
  button: { marginTop: 0 },
});
