import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Category, CategoryId } from "@/types/listing";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";

type CategoryPillProps = {
  category: Category;
  onPress?: (id: CategoryId) => void;
  selected?: boolean;
};

export function CategoryPill({ category, onPress, selected = false }: CategoryPillProps) {
  return (
    <Pressable
      onPress={() => onPress?.(category.id)}
          style={[
            styles.container,
            { backgroundColor: selected ? colors.charcoal : category.background },
            selected && styles.selected
      ]}
    >
      <View style={[styles.icon, { backgroundColor: selected ? colors.white : "#FFFFFF99" }]}>
        <Text style={[styles.iconText, { color: category.accent }]}>{category.emoji}</Text>
      </View>
      <Text style={[styles.label, { color: selected ? colors.white : colors.charcoal }]}>
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderColor: "#FFFFFF90",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.sm
  },
  icon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  iconText: {
    fontSize: 12,
    fontWeight: "800"
  },
  label: {
    fontSize: typography.body,
    fontWeight: "800"
  },
  selected: {
    ...shadows.soft
  }
});
