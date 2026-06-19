import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Conversation, Message } from "@/types/message";

export const CONVERSATIONS_STORAGE_KEY = "nest-market:conversations:v1";
export const MESSAGES_STORAGE_KEY = "nest-market:messages:v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeConversation = (value: unknown): Conversation | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.listingId !== "string" ||
    typeof value.listingTitle !== "string" ||
    typeof value.listingImage !== "string" ||
    (value.listingType !== "product" && value.listingType !== "rent") ||
    typeof value.otherUserName !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    lastMessage: typeof value.lastMessage === "string" ? value.lastMessage : "",
    lastMessageAt: typeof value.lastMessageAt === "string" ? value.lastMessageAt : new Date(0).toISOString(),
    listingId: value.listingId,
    listingImage: value.listingImage,
    listingTitle: value.listingTitle,
    listingType: value.listingType,
    otherUserName: value.otherUserName,
    unreadCount: typeof value.unreadCount === "number" && value.unreadCount > 0 ? Math.floor(value.unreadCount) : 0
  };
};

const normalizeMessage = (value: unknown): Message | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.conversationId !== "string" ||
    (value.senderType !== "me" && value.senderType !== "other") ||
    typeof value.text !== "string"
  ) {
    return null;
  }

  return {
    conversationId: value.conversationId,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date(0).toISOString(),
    id: value.id,
    senderType: value.senderType,
    text: value.text
  };
};

export function createLocalConversationId(listingId: string) {
  return `conversation-${listingId}`;
}

export function createLocalMessageId() {
  return `message-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export async function readConversations(): Promise<Array<Conversation>> {
  try {
    const raw = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      const conversation = normalizeConversation(item);
      return conversation ? [conversation] : [];
    });
  } catch {
    return [];
  }
}

export async function writeConversations(conversations: Array<Conversation>) {
  await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
}

export async function readMessages(): Promise<Array<Message>> {
  try {
    const raw = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      const message = normalizeMessage(item);
      return message ? [message] : [];
    });
  } catch {
    return [];
  }
}

export async function writeMessages(messages: Array<Message>) {
  await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}
