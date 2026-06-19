import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AuthRequiredState } from "@/components/AuthRequiredState";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/state/AuthContext";
import { useMessages } from "@/state/MessagesContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { Conversation } from "@/types/message";
import { formatConversationTime } from "@/utils/time";

export default function MessagesScreen() {
  const { isAuthReady, isAuthenticated, isRemoteMode } = useAuth();
  const { conversations, isReady } = useMessages();

  if (isRemoteMode && !isAuthReady) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <Text style={styles.subtitle}>正在读取登录状态...</Text>
        </View>
      </Screen>
    );
  }

  if (isRemoteMode && !isAuthenticated) {
    return (
      <Screen>
        <AuthRequiredState title="登录后查看消息" message="聊天仍是本地模拟；远程模式下需要先登录才能打开消息入口。" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>消息</Text>
          <Text style={styles.subtitle}>本地原型会保存你和商品发布者的假聊天记录</Text>
        </View>

        {!isReady ? (
          <EmptyState icon="chatbubble-ellipses-outline" title="正在读取本地消息" />
        ) : conversations.length ? (
          <View style={styles.conversationList}>
            {conversations.map((conversation) => (
              <ConversationRow conversation={conversation} key={conversation.id} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="还没有消息"
            message="从详情页点“我想要”或“咨询转租”后，会在这里出现会话。"
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const isRent = conversation.listingType === "rent";

  return (
    <Pressable
      onPress={() => router.push(`/chat/${conversation.id}` as never)}
      style={styles.conversationRow}
    >
      <Image source={{ uri: conversation.listingImage }} style={styles.coverImage} />
      <View style={styles.conversationBody}>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.listingTitle}>
            {conversation.listingTitle}
          </Text>
          <Text style={styles.time}>{formatConversationTime(conversation.lastMessageAt)}</Text>
        </View>
        <View style={styles.userLine}>
          <View style={[styles.typeBadge, isRent && styles.rentBadge]}>
            <Text style={[styles.typeBadgeText, isRent && styles.rentBadgeText]}>
              {isRent ? "转租" : "商品"}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.userName}>
            {conversation.otherUserName}
          </Text>
        </View>
        <View style={styles.messageLine}>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
    paddingTop: 16
  },
  conversationBody: {
    flex: 1,
    gap: spacing.xs
  },
  conversationList: {
    gap: spacing.sm
  },
  conversationRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 112,
    padding: spacing.sm,
    ...shadows.card
  },
  coverImage: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    height: 80,
    width: 80
  },
  header: {
    gap: spacing.xs
  },
  lastMessage: {
    color: colors.muted,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "700"
  },
  listingTitle: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.bodyLarge,
    fontWeight: "900"
  },
  messageLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  rentBadge: {
    backgroundColor: colors.rentSoft
  },
  rentBadgeText: {
    color: colors.rent
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  },
  time: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "700"
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.screenTitle,
    fontWeight: "900"
  },
  typeBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  typeBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900"
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: radius.lg,
    minHeight: 22,
    minWidth: 22,
    justifyContent: "center",
    paddingHorizontal: 7
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  userLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  userName: {
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "800"
  }
});
