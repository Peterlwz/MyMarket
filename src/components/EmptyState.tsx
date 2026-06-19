import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing, typography } from "@/theme/spacing";

type EmptyStateProps = {
  icon?: ComponentProps<typeof Ionicons>["name"];
  message?: string;
  title: string;
};

export function EmptyState({ icon = "search-outline", message, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.accent} name={icon} size={24} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48
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
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
