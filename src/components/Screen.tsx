import { type PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
}>;

export function Screen({ children, padded = false }: ScreenProps) {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: colors.background,
        flex: 1,
        paddingHorizontal: padded ? 16 : 0
      }}
    >
      {children}
    </SafeAreaView>
  );
}
