import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { Category, CategoryId } from "@/types/listing";

type CategoryGridProps = {
  categories: Array<Category>;
  onSelect: (id: CategoryId) => void;
  selectedId: CategoryId;
};

export function CategoryGrid({ categories, onSelect, selectedId }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const selected = selectedId === category.id;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[
              styles.item,
              { backgroundColor: selected ? colors.charcoal : category.background },
              selected && styles.itemSelected
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  icon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  iconText: {
    fontSize: 13,
    fontWeight: "900"
  },
  item: {
    borderColor: "#FFFFFF90",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 96,
    padding: spacing.sm,
    width: "30.8%"
  },
  itemSelected: {
    ...shadows.soft
  },
  label: {
    fontSize: typography.body,
    fontWeight: "900"
  }
});
