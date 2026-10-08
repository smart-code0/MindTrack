import { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

type Props = {
  /** Valor inicial entre 0 y 100 (un <input type="range"> sin value empieza en 50). */
  defaultValue?: number;
  /** Alto total que ocupaba el control (su caja de línea en el HTML). */
  height: number;
  /** Posición vertical de la pista dentro del control. */
  trackTop: number;
  trackHeight: number;
  trackColor: string;
  trackRadius: number;
  thumbWidth: number;
  thumbHeight: number;
  thumbRadius: number;
  thumbShadow: string;
  /** Posición vertical del círculo respecto al borde superior de la pista. */
  thumbOffset: number;
};

/** Control deslizante 0–100 con el mismo aspecto que los sliders del registro diario. */
export function RangeSlider({
  defaultValue = 50,
  height,
  trackTop,
  trackHeight,
  trackColor,
  trackRadius,
  thumbWidth,
  thumbHeight,
  thumbRadius,
  thumbShadow,
  thumbOffset,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const width = useRef(0);
  const start = useRef(0);

  const update = (x: number) => {
    const usable = width.current - thumbWidth;
    if (usable <= 0) return;
    const next = Math.round(Math.min(Math.max((x - thumbWidth / 2) / usable, 0), 1) * 100);
    setValue(next);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        start.current = e.nativeEvent.locationX;
        update(start.current);
      },
      onPanResponderMove: (_, g) => update(start.current + g.dx),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    width.current = e.nativeEvent.layout.width;
  };

  return (
    <View
      style={{ height }}
      onLayout={onLayout}
      {...responder.panHandlers}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <View
        pointerEvents="none"
        style={[styles.track, { top: trackTop, height: trackHeight, backgroundColor: trackColor, borderRadius: trackRadius }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            top: trackTop + thumbOffset,
            width: thumbWidth,
            height: thumbHeight,
            borderRadius: thumbRadius,
            boxShadow: thumbShadow,
            left: `${value}%`,
            transform: [{ translateX: (-thumbWidth * value) / 100 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: 'absolute', left: 0, right: 0 },
  thumb: { position: 'absolute', backgroundColor: '#ffffff' },
});
