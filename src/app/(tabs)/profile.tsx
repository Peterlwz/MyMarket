import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AuthRequiredState } from "@/components/AuthRequiredState";
import { EmptyState } from "@/components/EmptyState";
import { ListingFeed } from "@/components/ListingFeed";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import type { StoredListing } from "@/services";
import { useAuth } from "@/state/AuthContext";
import { useListings } from "@/state/ListingsContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { ListingStatus } from "@/types/listing";
import { getListingCoverImage } from "@/utils/listingImages";
import { getListingStatusLabel } from "@/utils/listingStatus";

const profileActions: Array<{
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
}> = [
  { icon: "chatbubble-ellipses-outline", label: "消息" },
  { icon: "heart-outline", label: "我的收藏" },
  { icon: "receipt-outline", label: "交易记录" }
];

const parseAmount = (value: string) => {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
};

export default function ProfileScreen() {
  const { isAuthReady, isAuthenticated, isRemoteMode, signOut, user } = useAuth();
  const {
    favoriteListingIds,
    getListingById,
    myListings,
    removeListing,
    setListingStatus,
    showNotice,
    updateListing
  } = useListings();
  const [amountDraft, setAmountDraft] = useState("");
  const [amountError, setAmountError] = useState("");
  const [amountTarget, setAmountTarget] = useState<StoredListing | null>(null);
  const [manageTarget, setManageTarget] = useState<StoredListing | null>(null);
  const activeCount = myListings.filter((listing) => listing.status === "active").length;
  const favoriteListings = favoriteListingIds.flatMap((id) => {
    const listing = getListingById(id);
    return listing ? [listing] : [];
  });
  const removedCount = myListings.filter((listing) => listing.status === "removed").length;
  const reservedCount = myListings.filter((listing) => listing.status === "reserved").length;
  const soldCount = myListings.filter((listing) => listing.status === "sold").length;
  const profileName = isRemoteMode ? user?.email ?? "Supabase 用户" : "蒲公英用户";
  const profileMeta = isRemoteMode ? "Supabase 登录用户 · Remote mode" : "信用良好 · 已完成 12 次交易";

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotice("已退出登录");
    } catch (error) {
      console.error("Failed to sign out", error);
      showNotice(error instanceof Error ? error.message : "退出失败，请稍后再试");
    }
  };

  if (isRemoteMode && !isAuthReady) {
    return (
      <Screen>
        <View style={styles.authLoading}>
          <Text style={styles.meta}>正在读取登录状态...</Text>
        </View>
      </Screen>
    );
  }

  if (isRemoteMode && !isAuthenticated) {
    return (
      <Screen>
        <AuthRequiredState title="登录后查看我的页面" message="远程模式下，我的发布、我的收藏和管理操作会关联到你的 Supabase 用户。" />
      </Screen>
    );
  }

  const handleStatusChange = async (listing: StoredListing, status: ListingStatus) => {
    await setListingStatus(listing.id, status);
    showNotice(`已更新为${getListingStatusLabel(status)}`);
    setManageTarget(null);
  };

  const handleDelete = (listing: StoredListing) => {
    Alert.alert("删除发布", `确定删除「${listing.title}」吗？`, [
      { style: "cancel", text: "取消" },
      {
        onPress: async () => {
          await removeListing(listing.id);
          showNotice("已删除发布");
          setManageTarget(null);
        },
        style: "destructive",
        text: "删除"
      }
    ]);
  };

  const openAmountEditor = (listing: StoredListing) => {
    setManageTarget(null);
    setAmountTarget(listing);
    setAmountDraft(String(listing.type === "rent" ? listing.monthlyRent : listing.price));
    setAmountError("");
  };

  const closeAmountEditor = () => {
    setAmountTarget(null);
    setAmountDraft("");
    setAmountError("");
  };

  const handleSaveAmount = async () => {
    if (!amountTarget) {
      return;
    }

    const amount = parseAmount(amountDraft);

    if (!amount) {
      setAmountError(amountTarget.type === "rent" ? "请填写正确的月租。" : "请填写正确的价格。");
      return;
    }

    const nextListing: StoredListing =
      amountTarget.type === "rent"
        ? { ...amountTarget, monthlyRent: amount }
        : { ...amountTarget, price: amount };

    await updateListing(amountTarget.id, nextListing);
    showNotice(amountTarget.type === "rent" ? "月租已更新" : "价格已更新");
    closeAmountEditor();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80"
            }}
            style={styles.avatar}
          />
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.name}>{profileName}</Text>
            <Text style={styles.meta}>{profileMeta}</Text>
          </View>
          {isRemoteMode ? (
            <Pressable onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>退出</Text>
            </Pressable>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>卖家</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <Stat label="发布中" value={activeCount} />
          <Stat label="已预留" value={reservedCount} />
          <Stat label="已出" value={soldCount} />
          <Stat label="下架" value={removedCount} />
        </View>

        <View style={styles.actionList}>
          {profileActions.map((item) => (
            <View key={item.label} style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons color={colors.accent} name={item.icon} size={20} />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
              <Ionicons color={colors.muted} name="chevron-forward" size={18} />
            </View>
          ))}
        </View>

        <View style={styles.tradeReminder}>
          <View style={styles.tradeReminderIcon}>
            <Ionicons color={colors.coral} name="shield-checkmark-outline" size={20} />
          </View>
          <Text style={styles.tradeReminderText}>
            线下交易请注意验货，不要提前转账。转租请核实房源和合同信息。
          </Text>
        </View>

        <SectionHeader meta={`${favoriteListings.length} 条`} title="我的收藏" />
        {favoriteListings.length ? (
          <ListingFeed items={favoriteListings} />
        ) : (
          <EmptyState icon="heart-outline" title="还没有收藏内容" message="看到喜欢的商品或转租，可以先点爱心留住。" />
        )}

        <SectionHeader meta={`${myListings.length} 条`} title="我的发布" />
        {myListings.length ? (
          <View style={styles.localList}>
            {myListings.map((listing) => (
              <LocalListingRow
                key={listing.id}
                listing={listing}
                onManage={setManageTarget}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="cube-outline" title="还没有本地发布" message="发布商品或转租后，会在这里管理状态。" />
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={Boolean(manageTarget)} onRequestClose={() => setManageTarget(null)}>
        <View style={styles.sheetBackdrop}>
          <Pressable onPress={() => setManageTarget(null)} style={styles.sheetDismiss} />
          <View style={styles.manageSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>管理发布</Text>
            {manageTarget ? (
              <>
                <SheetAction
                  icon="create-outline"
                  label="编辑"
                  onPress={() => {
                    router.push(`/edit-listing/${manageTarget.id}` as never);
                    setManageTarget(null);
                  }}
                />
                <SheetAction
                  icon="pricetag-outline"
                  label={manageTarget.type === "rent" ? "改月租" : "改价"}
                  onPress={() => openAmountEditor(manageTarget)}
                />
                <SheetAction
                  icon="time-outline"
                  label="标记为已预留"
                  onPress={() => handleStatusChange(manageTarget, "reserved")}
                />
                <SheetAction
                  icon="checkmark-done-outline"
                  label="标记为已出"
                  onPress={() => handleStatusChange(manageTarget, "sold")}
                />
                <SheetAction
                  icon="archive-outline"
                  label="下架"
                  onPress={() => handleStatusChange(manageTarget, "removed")}
                />
                {manageTarget.status !== "active" ? (
                  <SheetAction
                    icon="arrow-up-circle-outline"
                    label="重新上架"
                    onPress={() => handleStatusChange(manageTarget, "active")}
                  />
                ) : null}
                <SheetAction
                  destructive
                  icon="trash-outline"
                  label="删除"
                  onPress={() => handleDelete(manageTarget)}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={Boolean(amountTarget)} onRequestClose={closeAmountEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.amountModal}>
            <Text style={styles.modalTitle}>{amountTarget?.type === "rent" ? "修改月租" : "修改价格"}</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => {
                setAmountDraft(value);
                setAmountError("");
              }}
              placeholder={amountTarget?.type === "rent" ? "输入新的月租" : "输入新的价格"}
              placeholderTextColor="#A19A90"
              style={[styles.amountInput, amountError && styles.amountInputError]}
              value={amountDraft}
            />
            {amountError ? <Text style={styles.amountError}>{amountError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable onPress={closeAmountEditor} style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryText}>取消</Text>
              </Pressable>
              <Pressable onPress={handleSaveAmount} style={styles.modalPrimaryButton}>
                <Text style={styles.modalPrimaryText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LocalListingRow({
  listing,
  onManage
}: {
  listing: StoredListing;
  onManage: (listing: StoredListing) => void;
}) {
  const priceText = listing.type === "rent" ? `¥${listing.monthlyRent}/月` : `¥${listing.price}`;
  const coverImage = getListingCoverImage(listing);

  return (
    <View style={styles.localRow}>
      <Pressable
        onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
        style={styles.localMain}
      >
        <Image source={{ uri: coverImage }} style={styles.localImage} />
        <View style={styles.localInfo}>
          <View style={styles.localTop}>
            <Text numberOfLines={2} style={styles.localTitle}>
              {listing.title}
            </Text>
            <Text style={styles.localPrice}>{priceText}</Text>
          </View>
          <View style={styles.localMetaRow}>
            <StatusBadge compact status={listing.status} />
            <Text numberOfLines={1} style={styles.localMeta}>
              {listing.location} · {listing.postedAt}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.localActions}>
        <Pressable onPress={() => onManage(listing)} style={styles.manageButton}>
          <Ionicons color={colors.charcoal} name="ellipsis-horizontal" size={18} />
          <Text style={styles.manageButtonText}>管理</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SheetAction({
  destructive = false,
  icon,
  label,
  onPress
}: {
  destructive?: boolean;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.sheetAction}>
      <View style={[styles.sheetActionIcon, destructive && styles.sheetActionIconDanger]}>
        <Ionicons color={destructive ? colors.coral : colors.accent} name={icon} size={19} />
      </View>
      <Text style={[styles.sheetActionText, destructive && styles.deleteText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  actionLabel: {
    color: colors.charcoal,
    flex: 1,
    fontSize: 15,
    fontWeight: "800"
  },
  actionList: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    overflow: "hidden",
    ...shadows.soft
  },
  actionRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: 14
  },
  amountError: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700"
  },
  amountInput: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.charcoal,
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: 14
  },
  amountInputError: {
    borderColor: colors.coral
  },
  amountModal: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.md,
    width: "86%"
  },
  avatar: {
    borderRadius: radius.lg,
    height: 64,
    width: 64
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900"
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 120,
    paddingTop: 16
  },
  deleteText: {
    color: colors.coral
  },
  localActions: {
    alignItems: "flex-end"
  },
  localList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  localImage: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    height: 76,
    width: 76
  },
  localInfo: {
    flex: 1,
    gap: spacing.xs
  },
  localMain: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  localMeta: {
    color: colors.muted,
    flex: 1,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  localMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  localPrice: {
    color: colors.coral,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  localRow: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.soft
  },
  localTitle: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.bodyLarge,
    fontWeight: "900",
    lineHeight: 20
  },
  localTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  manageButton: {
    alignItems: "center",
    backgroundColor: colors.sand,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    width: 104
  },
  manageButtonText: {
    color: colors.charcoal,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  authLoading: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  },
  modalActions: {
    flexDirection: "row",
    gap: 10
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "#20242780",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  modalPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    flex: 1,
    minHeight: 48,
    justifyContent: "center"
  },
  modalPrimaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  modalSecondaryButton: {
    alignItems: "center",
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    flex: 1,
    minHeight: 48,
    justifyContent: "center"
  },
  modalSecondaryText: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: "900"
  },
  modalTitle: {
    color: colors.charcoal,
    fontSize: typography.title,
    fontWeight: "900"
  },
  name: {
    color: colors.charcoal,
    fontSize: 22,
    fontWeight: "900"
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    ...shadows.soft
  },
  profileText: {
    flex: 1,
    gap: 4
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: colors.sand,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  signOutText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: "900"
  },
  stat: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingVertical: 12
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  statValue: {
    color: colors.charcoal,
    fontSize: 20,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md
  },
  tradeReminder: {
    alignItems: "center",
    backgroundColor: "#FFF1EE",
    borderColor: "#F4C7BE",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    padding: spacing.md
  },
  tradeReminderIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  tradeReminderText: {
    color: colors.charcoal,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  manageSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: 4,
    paddingBottom: 28,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  sheetAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52
  },
  sheetActionIcon: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  sheetActionIconDanger: {
    backgroundColor: "#FFF1EE"
  },
  sheetActionText: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.bodyLarge,
    fontWeight: "900"
  },
  sheetBackdrop: {
    backgroundColor: "#20242780",
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetDismiss: {
    flex: 1
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.lg,
    height: 4,
    marginBottom: spacing.xs,
    width: 44
  }
});
