import { type ReactNode, useRef } from "react";
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";

type PressableScaleProps = Omit<PressableProps, "style"> & {
  children: ReactNode;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  disabled,
  onPressIn,
  onPressOut,
  pressedScale = 0.97,
  style,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      friction: 8,
      tension: 120,
      toValue: value,
      useNativeDriver: true
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      animateTo(pressedScale);
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(event);
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
