import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  width: number;
  height: number;
  knobSize: number;
  /** Separación del círculo respecto al borde. */
  inset: number;
  offColor: string;
  onColor: string;
  knobShadow?: string;
  /** Duración de la transición del círculo (ms), igual que en el CSS. */
  duration: number;
  /** Recorrido del círculo; por defecto, de un borde al otro. */
  travel?: number;
};

/** Interruptor on/off con la misma animación de desplazamiento que el CSS original. */
export function ToggleSwitch({
  value,
  onValueChange,
  width,
  height,
  knobSize,
  inset,
  offColor,
  onColor,
  knobShadow,
  duration,
  travel = width - knobSize - inset * 2,
}: Props) {
  const position = useRef(new Animated.Value(value ? travel : 0)).current;

  useEffect(() => {
    Animated.timing(position, { toValue: value ? travel : 0, duration, useNativeDriver: true }).start();
  }, [value, travel, duration, position]);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      role="switch"
      aria-checked={value}
      style={[styles.track, { width, height, borderRadius: height, backgroundColor: value ? onColor : offColor }]}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            top: inset,
            left: inset,
            boxShadow: knobShadow,
            transform: [{ translateX: position }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { position: 'relative' },
  knob: { position: 'absolute', backgroundColor: '#ffffff' },
});
