import { StyleSheet, Text, View } from "react-native";

import { radius } from "@/theme/spacing";
import type { ListingStatus } from "@/types/listing";
import { getListingStatusColors, getListingStatusLabel } from "@/utils/listingStatus";

type StatusBadgeProps = {
  compact?: boolean;
  status: ListingStatus;
};

export function StatusBadge({ compact = false, status }: StatusBadgeProps) {
  const statusColors = getListingStatusColors(status);

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        { backgroundColor: statusColors.backgroundColor }
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText, { color: statusColors.color }]}>
        {getListingStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.md,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  compact: {
    minHeight: 24,
    paddingHorizontal: 8
  },
  compactText: {
    fontSize: 11
  },
  text: {
    fontSize: 12,
    fontWeight: "900"
  }
});
