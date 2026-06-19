import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing, typography } from "@/theme/spacing";

type SectionHeaderProps = {
  meta?: string;
  subtitle?: string;
  title: string;
};

export function SectionHeader({ meta, subtitle, title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md
  },
  meta: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.title,
    fontWeight: "900"
  }
});
