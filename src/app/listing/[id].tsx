import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBadge } from "@/components/StatusBadge";
import { categories } from "@/data/mock";
import { useAuth } from "@/state/AuthContext";
import { useListings } from "@/state/ListingsContext";
import { useMessages } from "@/state/MessagesContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import { getListingImages } from "@/utils/listingImages";
import { getListingStatusLabel, isListingContactable } from "@/utils/listingStatus";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const { isAuthenticated, isRemoteMode } = useAuth();
  const { getListingById, isFavorite, isReady, showNotice, toggleFavorite } = useListings();
  const { createOrOpenConversation, isReady: messagesReady } = useMessages();
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const listing = id ? getListingById(id) ?? null : null;

  if (!isReady) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>正在读取本地数据</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>没找到这条信息</Text>
        <Pressable onPress={() => router.back()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>返回</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isRent = listing.type === "rent";
  const categoryLabel = categories.find((category) => category.id === listing.categoryId)?.label ?? "其他";
  const favorite = isFavorite(listing.id);
  const listingImages = getListingImages(listing);
  const canContact = isListingContactable(listing.status);
  const contactText = canContact ? (isRent ? "咨询转租" : "我想要") : getListingStatusLabel(listing.status);
  const handleContactPress = async () => {
    if (isOpeningChat || !messagesReady || !canContact) {
      return;
    }

    if (isRemoteMode && !isAuthenticated) {
      showNotice("登录后才能联系发布者");
      router.push("/auth" as never);
      return;
    }

    try {
      setIsOpeningChat(true);
      const conversation = await createOrOpenConversation(listing);

      router.push(`/chat/${conversation.id}` as never);
    } catch {
      showNotice("消息创建失败，请稍后再试");
    } finally {
      setIsOpeningChat(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {listingImages.map((imageUri) => (
              <Image key={imageUri} source={{ uri: imageUri }} style={[styles.heroImage, { width }]} />
            ))}
          </ScrollView>
          {listingImages.length > 1 ? (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>{listingImages.length} 张</Text>
            </View>
          ) : null}
          <SafeAreaView edges={["top"]} style={styles.topOverlay}>
            <Pressable onPress={() => router.back()} style={styles.roundButton}>
              <Ionicons color={colors.charcoal} name="chevron-back" size={22} />
            </Pressable>
            <Pressable onPress={() => toggleFavorite(listing.id)} style={styles.roundButton}>
              <Ionicons
                color={favorite ? colors.coral : colors.charcoal}
                name={favorite ? "heart" : "heart-outline"}
                size={22}
              />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.mainCard}>
          <StatusBadge status={listing.status} />
          <View style={styles.priceLine}>
            <Text style={[styles.price, isRent && styles.rentPrice]}>
              ¥{isRent ? listing.monthlyRent : listing.price}
            </Text>
            <Text style={styles.priceSuffix}>{isRent ? "/月" : listing.originalPrice ? `原价 ¥${listing.originalPrice}` : ""}</Text>
          </View>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons color={colors.muted} name="location-outline" size={16} />
            <Text style={styles.location}>{listing.location} · {listing.postedAt}</Text>
          </View>
        </View>

        <View style={styles.sellerCard}>
          <Image source={{ uri: listing.seller.avatar }} style={styles.sellerAvatar} />
          <View style={styles.sellerText}>
            <Text style={styles.sellerName}>{listing.seller.name}</Text>
            <Text style={styles.sellerMeta}>评分 {listing.seller.rating} · 个人发布</Text>
          </View>
          <View style={styles.sellerBadge}>
            <Text style={styles.sellerBadgeText}>可信</Text>
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.blockTitle}>{isRent ? "转租信息" : "商品信息"}</Text>
          {isRent ? (
            <View style={styles.specGrid}>
              <Spec label="月租" value={`¥${listing.monthlyRent}`} />
              <Spec label="房型" value={listing.roomType} />
              <Spec label="入住" value={listing.availableFrom} />
              <Spec label="租期" value={listing.leaseTerm} />
              <Spec label="区域" value={listing.district} />
            </View>
          ) : (
            <View style={styles.specGrid}>
              <Spec label="价格" value={`¥${listing.price}`} />
              <Spec label="成色" value={listing.condition} />
              <Spec label="分类" value={categoryLabel} />
              <Spec label="位置" value={listing.location} />
            </View>
          )}
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.blockTitle}>描述</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <View style={styles.safetyBlock}>
          <View style={styles.safetyHeader}>
            <Ionicons color={colors.coral} name="shield-checkmark-outline" size={20} />
            <Text style={styles.blockTitle}>交易安全提醒</Text>
          </View>
          <SafetyRow text="建议线下见面交易" />
          <SafetyRow text="不要提前转账" />
          <SafetyRow text="转租请核实房东/合同/押金信息" />
          <SafetyRow text="平台当前不提供担保交易" />
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.contactBar}>
        <Pressable onPress={() => toggleFavorite(listing.id)} style={styles.secondaryButton}>
          <Ionicons
            color={favorite ? colors.coral : colors.charcoal}
            name={favorite ? "heart" : "heart-outline"}
            size={20}
          />
          <Text style={styles.secondaryButtonText}>{favorite ? "已收藏" : "收藏"}</Text>
        </Pressable>
        <Pressable
          disabled={isOpeningChat || !messagesReady || !canContact}
          onPress={handleContactPress}
          style={[
            styles.primaryButton,
            isRent && styles.rentButton,
            (isOpeningChat || !messagesReady || !canContact) && styles.primaryButtonDisabled
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {canContact && !messagesReady ? "读取中..." : isOpeningChat ? "打开中..." : contactText}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.specValue}>
        {value}
      </Text>
    </View>
  );
}

function SafetyRow({ text }: { text: string }) {
  return (
    <View style={styles.safetyRow}>
      <Ionicons color={colors.coral} name="alert-circle-outline" size={16} />
      <Text style={styles.safetyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  blockTitle: {
    color: colors.charcoal,
    fontSize: typography.title,
    fontWeight: "900"
  },
  contactBar: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 12,
    left: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    position: "absolute",
    right: 0
  },
  content: {
    paddingBottom: 168
  },
  description: {
    color: colors.charcoal,
    fontSize: typography.bodyLarge,
    lineHeight: 24
  },
  detailBlock: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: 12,
    padding: spacing.md,
    ...shadows.soft
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24
  },
  emptyButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: "900"
  },
  heroImage: {
    height: "100%",
    width: "100%"
  },
  imageWrap: {
    backgroundColor: colors.sand,
    height: 430
  },
  imageCountBadge: {
    backgroundColor: "#202427CC",
    borderRadius: radius.md,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
    right: 16
  },
  imageCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  location: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: "700"
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  mainCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: -36,
    padding: spacing.md,
    ...shadows.card
  },
  price: {
    color: colors.coral,
    fontSize: 34,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  priceLine: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8
  },
  priceSuffix: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    flex: 1,
    minHeight: 52,
    justifyContent: "center"
  },
  primaryButtonDisabled: {
    opacity: 0.64
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  rentButton: {
    backgroundColor: colors.rent
  },
  rentPrice: {
    color: colors.rent
  },
  root: {
    backgroundColor: colors.background,
    flex: 1
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFFE6",
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: 8,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: "900"
  },
  sellerAvatar: {
    borderRadius: radius.lg,
    height: 48,
    width: 48
  },
  sellerBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  sellerBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900"
  },
  sellerCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: 12,
    padding: spacing.md,
    ...shadows.soft
  },
  sellerMeta: {
    color: colors.muted,
    fontSize: 13
  },
  sellerName: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "900"
  },
  sellerText: {
    flex: 1,
    gap: 4
  },
  safetyBlock: {
    backgroundColor: "#FFF8F3",
    borderColor: "#F4C7BE",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: 12,
    padding: spacing.md
  },
  safetyHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  safetyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  safetyText: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  spec: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    gap: 6,
    minHeight: 72,
    padding: 10,
    width: "47.8%"
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  specLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  specValue: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  title: {
    color: colors.charcoal,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29
  },
  topOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
    top: 0
  }
});
