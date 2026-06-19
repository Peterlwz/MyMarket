import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";

type AuthRequiredStateProps = {
  message?: string;
  title?: string;
};

export function AuthRequiredState({
  message = "登录后可以继续使用这个功能。",
  title = "请先登录"
}: AuthRequiredStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons color={colors.accent} name="person-circle-outline" size={30} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable onPress={() => router.push("/auth" as never)} style={styles.button}>
          <Text style={styles.buttonText}>去登录</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 48,
    justifyContent: "center",
    marginTop: spacing.xs,
    paddingHorizontal: 24,
    width: "100%"
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: "900"
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    width: "100%",
    ...shadows.card
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  message: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center"
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.title,
    fontWeight: "900"
  },
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  }
});
