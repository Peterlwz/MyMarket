import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing, typography } from "@/theme/spacing";

import { SearchBar } from "./SearchBar";

type AppHeaderProps = {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
};

export function AppHeader({ onSearchChange, searchValue }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>欢迎回来</Text>
          <Text style={styles.title}>今天淘点实用的</Text>
          <Text style={styles.subtitle}>二手好物和转租信息都在附近</Text>
        </View>
        <View style={styles.location}>
          <Ionicons color={colors.accent} name="location-outline" size={16} />
          <Text style={styles.locationText}>附近</Text>
        </View>
      </View>
      <SearchBar onChangeText={onSearchChange} value={searchValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: 8
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  location: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: 4,
    minHeight: 42,
    paddingHorizontal: spacing.sm
  },
  locationText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: "700"
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.screenTitle,
    fontWeight: "900",
    marginTop: 4
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    marginTop: 4
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
