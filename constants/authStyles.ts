import { StyleSheet } from 'react-native';

import { fonts } from './theme';

/** Estilos compartidos por login y registro (style1.css). */
export const authStyles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: '#e3ebfc',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logoWrap: { alignItems: 'center', marginBottom: 22 },
  logo: { width: 125, height: 125 * (113 / 386) },
  heroTitle: { ...fonts.arial(), fontSize: 24, color: '#000B6B', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { ...fonts.arial(), fontSize: 14, lineHeight: 21, color: '#949494', textAlign: 'center' },
  formCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    paddingTop: 32,
    paddingHorizontal: 26,
    paddingBottom: 30,
  },
  label: { ...fonts.arial(), fontSize: 13, color: '#26263a', marginTop: 18, marginBottom: 8 },
  primaryButton: {
    height: 49,
    marginTop: 26,
    borderRadius: 15,
    boxShadow: '2px 5px 5px #c7c7c7',
  },
  primaryButtonText: { ...fonts.arial(), fontSize: 15, color: '#ffffff' },
});
