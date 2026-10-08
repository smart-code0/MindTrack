import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { IconName } from '@/constants/icons';
import { Icon } from './Icon';

type Props = Pick<TextInputProps, 'placeholder' | 'keyboardType' | 'autoComplete' | 'autoCapitalize'> & {
  icon: IconName;
  /** Alto de la caja del icono (en el HTML dependía del tipo de icono: 23 o 25 px). */
  iconBoxHeight?: number;
  /** Campo de contraseña con botón de ojo para mostrarla u ocultarla. */
  password?: 'solar' | 'fa';
};

const EYE = {
  // Login: icono de Iconify de 25 px en color lavanda.
  solar: { name: 'solar:eye-linear', size: 25, color: '#8b99c8', boxHeight: 29 },
  // Registro: icono de Font Awesome de 16 px en negro.
  fa: { name: 'fa-regular:eye', size: 16, color: '#000000', boxHeight: 18 },
} as const;

/** Campo con icono de las pantallas de login y registro (.input-group de style1.css). */
export function AuthInput({ icon, iconBoxHeight = 23, password, ...inputProps }: Props) {
  const [hidden, setHidden] = useState(true);
  const eye = password && EYE[password];

  return (
    <View style={styles.group}>
      <View style={[styles.iconBox, { height: iconBoxHeight }]}>
        <Icon name={icon} size={20} color="#8B99C8" />
      </View>
      <TextInput
        {...inputProps}
        secureTextEntry={!!password && hidden}
        placeholderTextColor="#757575"
        style={styles.input}
      />
      {eye && (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          style={[styles.eye, { height: eye.boxHeight }]}
          accessibilityRole="button"
          accessibilityLabel="Mostrar contraseña"
          hitSlop={8}
        >
          <Icon name={eye.name} size={eye.size} color={eye.color} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f2f2f8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBox: { justifyContent: 'center' },
  input: {
    flex: 1,
    height: 23,
    padding: 0,
    ...fonts.arial(),
    fontSize: 14,
    color: '#1c281c',
  },
  eye: { justifyContent: 'center' },
});
