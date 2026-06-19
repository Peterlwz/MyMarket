import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { StatusBadge } from "@/components/StatusBadge";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { ProductListing } from "@/types/listing";
import { getListingCoverImage } from "@/utils/listingImages";

type ListingCardProps = {
  isFavorite?: boolean;
  item: ProductListing;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

export function ListingCard({ isFavorite = false, item, onPress, onToggleFavorite }: ListingCardProps) {
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
      <View style={styles.imageWrap}>
        <Image source={{ uri: coverImage }} style={styles.image} />
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
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>¥{item.price}</Text>
          {item.originalPrice ? <Text style={styles.original}>¥{item.originalPrice}</Text> : null}
        </View>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.condition}</Text>
          </View>
          <Text numberOfLines={1} style={styles.location}>
            {item.location}
          </Text>
        </View>
        <View style={styles.sellerRow}>
          <Image source={{ uri: item.seller.avatar }} style={styles.avatar} />
          <Text numberOfLines={1} style={styles.seller}>
            {item.seller.name}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radius.sm,
    height: 20,
    width: 20
  },
  body: {
    gap: spacing.xs,
    padding: spacing.sm
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    ...shadows.card
  },
  chip: {
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  chipText: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: "700"
  },
  favoriteButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFFE8",
    borderRadius: radius.lg,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 36
  },
  image: {
    aspectRatio: 1,
    backgroundColor: colors.sand,
    width: "100%"
  },
  imageWrap: {
    position: "relative"
  },
  location: {
    color: colors.muted,
    flex: 1,
    fontSize: 11
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  original: {
    color: colors.muted,
    fontSize: 11,
    textDecorationLine: "line-through"
  },
  price: {
    color: colors.coral,
    fontSize: 21,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 6
  },
  seller: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "600"
  },
  sellerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  statusWrap: {
    bottom: 8,
    left: 8,
    position: "absolute"
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.body,
    fontWeight: "800",
    lineHeight: 19
  }
});
