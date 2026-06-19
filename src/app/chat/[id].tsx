import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthRequiredState } from "@/components/AuthRequiredState";
import { useAuth } from "@/state/AuthContext";
import { useMessages } from "@/state/MessagesContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { Message } from "@/types/message";
import { formatMessageTime } from "@/utils/time";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const { isAuthReady, isAuthenticated, isRemoteMode } = useAuth();
  const {
    getConversationById,
    getMessagesByConversationId,
    isReady,
    markConversationRead,
    sendMessage
  } = useMessages();
  const conversation = id ? getConversationById(id) : undefined;
  const conversationMessages = conversation ? getMessagesByConversationId(conversation.id) : [];
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (conversation) {
      void markConversationRead(conversation.id);
    }
  }, [conversation, conversationMessages.length, markConversationRead]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [conversationMessages.length]);

  const handleSend = async () => {
    const text = draft.trim();

    if (!conversation || !text || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setDraft("");
      await sendMessage(conversation.id, text);
    } finally {
      setIsSending(false);
    }
  };

  if (isRemoteMode && !isAuthReady) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>正在读取登录状态</Text>
      </SafeAreaView>
    );
  }

  if (isRemoteMode && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.authWrap}>
        <AuthRequiredState title="登录后才能聊天" message="当前聊天仍是本地模拟；远程模式下需要先登录才能使用。" />
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>正在读取本地消息</Text>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>没找到这条会话</Text>
        <Pressable onPress={() => router.back()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>返回</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isRent = conversation.listingType === "rent";

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons color={colors.charcoal} name="chevron-back" size={24} />
          </Pressable>
          <View style={styles.headerText}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {conversation.otherUserName}
            </Text>
            <Text style={styles.headerMeta}>本地模拟聊天</Text>
          </View>
          <View style={styles.headerButtonPlaceholder} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <Pressable
          onPress={() => router.push({ pathname: "/listing/[id]", params: { id: conversation.listingId } })}
          style={styles.listingCard}
        >
          <Image source={{ uri: conversation.listingImage }} style={styles.listingImage} />
          <View style={styles.listingInfo}>
            <View style={[styles.typeBadge, isRent && styles.rentBadge]}>
              <Text style={[styles.typeBadgeText, isRent && styles.rentBadgeText]}>
                {isRent ? "转租" : "商品"}
              </Text>
            </View>
            <Text numberOfLines={2} style={styles.listingTitle}>
              {conversation.listingTitle}
            </Text>
          </View>
          <Ionicons color={colors.muted} name="chevron-forward" size={18} />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.messageContent}
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          {conversationMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.inputBar}>
          <TextInput
            multiline
            onChangeText={setDraft}
            placeholder="输入消息"
            placeholderTextColor="#A19A90"
            style={styles.input}
            value={draft}
          />
          <Pressable
            disabled={!draft.trim() || isSending}
            onPress={handleSend}
            style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
          >
            <Ionicons color={colors.white} name="send" size={18} />
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMine = message.senderType === "me";

  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
          {message.text}
        </Text>
        <Text style={[styles.bubbleTime, isMine ? styles.bubbleTimeMine : styles.bubbleTimeOther]}>
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: radius.lg,
    gap: 6,
    maxWidth: "78%",
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10
  },
  bubbleMine: {
    backgroundColor: colors.charcoal
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1
  },
  bubbleRow: {
    flexDirection: "row"
  },
  bubbleRowMine: {
    justifyContent: "flex-end"
  },
  bubbleRowOther: {
    justifyContent: "flex-start"
  },
  bubbleText: {
    fontSize: typography.bodyLarge,
    lineHeight: 22
  },
  bubbleTextMine: {
    color: colors.white
  },
  bubbleTextOther: {
    color: colors.charcoal
  },
  bubbleTime: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
    textAlign: "right"
  },
  bubbleTimeMine: {
    color: "#FFFFFFB8"
  },
  bubbleTimeOther: {
    color: colors.muted
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
  authWrap: {
    backgroundColor: colors.background,
    flex: 1
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  headerButtonPlaceholder: {
    width: 44
  },
  headerMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  headerText: {
    alignItems: "center",
    flex: 1,
    gap: 3
  },
  headerTitle: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.charcoal,
    flex: 1,
    fontSize: typography.bodyLarge,
    maxHeight: 108,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingTop: 13,
    textAlignVertical: "top"
  },
  inputBar: {
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  keyboard: {
    flex: 1
  },
  listingCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    margin: spacing.md,
    minHeight: 88,
    padding: spacing.sm,
    ...shadows.soft
  },
  listingImage: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    height: 64,
    width: 64
  },
  listingInfo: {
    flex: 1,
    gap: spacing.xs
  },
  listingTitle: {
    color: colors.charcoal,
    fontSize: typography.bodyLarge,
    fontWeight: "900",
    lineHeight: 20
  },
  messageContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md
  },
  rentBadge: {
    backgroundColor: colors.rentSoft
  },
  rentBadgeText: {
    color: colors.rent
  },
  root: {
    backgroundColor: colors.background,
    flex: 1
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  sendButtonDisabled: {
    opacity: 0.45
  },
  topSafe: {
    backgroundColor: colors.background
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  typeBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900"
  }
});
