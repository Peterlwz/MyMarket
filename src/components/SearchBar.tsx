import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";

type SearchBarProps = {
  compact?: boolean;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function SearchBar({
  compact = false,
  onChangeText,
  placeholder = "搜商品、转租、区域",
  value
}: SearchBarProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Ionicons color={colors.muted} name="search" size={18} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {!compact ? (
        <View style={styles.filterButton}>
          <Ionicons color={colors.charcoal} name="options-outline" size={16} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    height: 46
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    height: 52,
    paddingHorizontal: spacing.sm,
    ...shadows.soft
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    height: 34,
    justifyContent: "center",
    marginLeft: "auto",
    width: 34
  },
  input: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "700",
    minHeight: 40,
    padding: 0
  }
});
