import { useState } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** Estilo de la caja (igual que los demás campos del formulario). */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Color de la flecha. */
  arrowColor: string;
  label?: string;
};

/**
 * Equivalente de un <select>: muestra el valor elegido con una flecha y abre la lista
 * de opciones en un modal.
 */
export function Dropdown({ value, options, onChange, style, textStyle, arrowColor, label }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={style}
        onPress={() => setOpen(true)}
        role="combobox"
        aria-label={label}
      >
        <Text style={textStyle} numberOfLines={1}>
          {value}
        </Text>
        {/* Flecha hecha con dos degradados en el CSS original: un triángulo de 12×6. */}
        <Svg width={12} height={6} style={styles.arrow}>
          <Polygon points="0,0 12,0 6,6" fill={arrowColor} />
        </Svg>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.option}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                role="menuitem"
                aria-selected={option === value}
              >
                <Text style={[textStyle, option === value && { color: arrowColor }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  arrow: { position: 'absolute', right: 15, top: 22 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', padding: 40 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 18, paddingVertical: 8 },
  option: { paddingVertical: 14, paddingHorizontal: 16 },
});
