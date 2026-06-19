import {
  createLocalConversationId,
  createLocalMessageId,
  readConversations,
  readMessages,
  writeConversations,
  writeMessages
} from "@/storage/messages";
import type { CreateMessageInput, ListingType } from "@/types/api";
import type { Listing } from "@/types/listing";
import type { Conversation, Message } from "@/types/message";
import { getListingCoverImage } from "@/utils/listingImages";

type MessageServiceResult = {
  conversation?: Conversation;
  conversations: Array<Conversation>;
  created?: boolean;
  message?: Message;
  messages: Array<Message>;
};

const sortConversations = (items: Array<Conversation>) =>
  [...items].sort((left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime());

const sortMessages = (items: Array<Message>) =>
  [...items].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

const getGreeting = (listing: Listing) =>
  listing.type === "rent" ? "你好，这个房源还可以看吗？" : "你好，这个还在吗？";

const getAutoReply = (listingType: ListingType) =>
  listingType === "rent" ? "房源还在，可以约时间看。" : "还在的，可以聊聊。";

export async function getConversations() {
  return sortConversations(await readConversations());
}

export async function getMessages() {
  return sortMessages(await readMessages());
}

async function appendMessage(input: CreateMessageInput): Promise<MessageServiceResult> {
  const text = input.text.trim();
  const conversations = await getConversations();
  const messages = await getMessages();
  const conversation = conversations.find((item) => item.id === input.conversationId);

  if (!text || !conversation) {
    return { conversations, messages };
  }

  const createdAt = new Date().toISOString();
  const message: Message = {
    conversationId: input.conversationId,
    createdAt,
    id: createLocalMessageId(),
    senderType: input.senderType ?? "me",
    text
  };
  const nextMessages = sortMessages([...messages, message]);
  const nextConversations = sortConversations(
    conversations.map((item) =>
      item.id === input.conversationId
        ? {
            ...item,
            lastMessage: text,
            lastMessageAt: createdAt,
            unreadCount: message.senderType === "other" ? item.unreadCount + 1 : item.unreadCount
          }
        : item
    )
  );

  await Promise.all([writeMessages(nextMessages), writeConversations(nextConversations)]);

  return {
    conversation: nextConversations.find((item) => item.id === input.conversationId),
    conversations: nextConversations,
    message,
    messages: nextMessages
  };
}

export async function openConversationForListing(listing: Listing): Promise<MessageServiceResult & { conversation: Conversation }> {
  const conversations = await getConversations();
  const messages = await getMessages();
  const existingConversation = conversations.find((item) => item.listingId === listing.id);

  if (existingConversation) {
    return {
      conversation: existingConversation,
      conversations,
      created: false,
      messages
    };
  }

  const createdAt = new Date().toISOString();
  const greeting = getGreeting(listing);
  const conversation: Conversation = {
    id: createLocalConversationId(listing.id),
    lastMessage: greeting,
    lastMessageAt: createdAt,
    listingId: listing.id,
    listingImage: getListingCoverImage(listing),
    listingTitle: listing.title,
    listingType: listing.type,
    otherUserName: listing.seller.name,
    unreadCount: 0
  };
  const message: Message = {
    conversationId: conversation.id,
    createdAt,
    id: createLocalMessageId(),
    senderType: "me",
    text: greeting
  };
  const nextConversations = sortConversations([conversation, ...conversations]);
  const nextMessages = sortMessages([...messages, message]);

  await Promise.all([writeConversations(nextConversations), writeMessages(nextMessages)]);

  return {
    conversation,
    conversations: nextConversations,
    created: true,
    message,
    messages: nextMessages
  };
}

export async function sendMessage(conversationId: string, text: string) {
  return appendMessage({ conversationId, senderType: "me", text });
}

export async function appendAutoReply(conversationId: string, listingType: ListingType) {
  return appendMessage({ conversationId, senderType: "other", text: getAutoReply(listingType) });
}

export async function markConversationRead(conversationId: string) {
  const conversations = await getConversations();
  const messages = await getMessages();
  const nextConversations = sortConversations(
    conversations.map((conversation) =>
      conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
    )
  );

  await writeConversations(nextConversations);

  return {
    conversation: nextConversations.find((conversation) => conversation.id === conversationId),
    conversations: nextConversations,
    messages
  };
}
