import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, ImageBackground, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { StatusBadge } from "@/components/StatusBadge";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { RentListing } from "@/types/listing";
import { getListingCoverImage } from "@/utils/listingImages";

type RentCardProps = {
  isFavorite?: boolean;
  item: RentListing;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

export function RentCard({ isFavorite = false, item, onPress, onToggleFavorite }: RentCardProps) {
  const coverImage = getListingCoverImage(item);
  const heartScale = useRef(new Animated.Value(1)).current;
  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Animated.sequence([
      Animated.spring(heartScale, {
        friction: 4,
        tension: 180,
        toValue: 1.18,
        useNativeDriver: true
      }),
      Animated.spring(heartScale, {
        friction: 5,
        tension: 160,
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
    onToggleFavorite?.();
  };

  return (
    <PressableScale onPress={onPress} style={styles.card}>
      <ImageBackground imageStyle={styles.image} source={{ uri: coverImage }} style={styles.imageWrap}>
        <View style={styles.badge}>
          <Ionicons color={colors.white} name="home" size={13} />
          <Text style={styles.badgeText}>转租</Text>
        </View>
        <View style={styles.statusWrap}>
          <StatusBadge compact status={item.status} />
        </View>
        <Pressable hitSlop={10} onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              color={isFavorite ? colors.coral : colors.charcoal}
              name={isFavorite ? "heart" : "heart-outline"}
              size={19}
            />
          </Animated.View>
        </Pressable>
      </ImageBackground>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.rent}>¥{item.monthlyRent}</Text>
          <Text style={styles.month}>/月</Text>
        </View>
        <View style={styles.infoBox}>
          <Text numberOfLines={1} style={styles.infoText}>
            {item.roomType}
          </Text>
          <Text numberOfLines={1} style={styles.infoText}>
            {item.district}
          </Text>
          <Text numberOfLines={1} style={styles.infoText}>
            {item.availableFrom}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.rent,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: 4,
    left: 8,
    minHeight: 28,
    paddingHorizontal: 8,
    position: "absolute",
    top: 8
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800"
  },
  body: {
    gap: spacing.xs,
    padding: spacing.sm
  },
  card: {
    backgroundColor: colors.rentSoft,
    borderColor: "#B8CBFF",
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    ...shadows.card,
    shadowColor: "#B8CBFF"
  },
  favoriteButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFFE6",
    borderRadius: radius.lg,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 36
  },
  image: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg
  },
  imageWrap: {
    aspectRatio: 1.05,
    backgroundColor: colors.rentSoft,
    overflow: "hidden",
    width: "100%"
  },
  infoBox: {
    backgroundColor: colors.white,
    borderColor: "#DCE6FF",
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    padding: 8
  },
  infoText: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: "700"
  },
  month: {
    color: colors.rent,
    fontSize: 12,
    fontWeight: "800"
  },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 2
  },
  statusWrap: {
    bottom: 8,
    left: 8,
    position: "absolute"
  },
  rent: {
    color: colors.rent,
    fontSize: 21,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 19
  }
});
