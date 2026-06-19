import type { Listing } from "@/types/listing";

export type Conversation = {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  listingId: string;
  listingImage: string;
  listingTitle: string;
  listingType: Listing["type"];
  otherUserName: string;
  unreadCount: number;
};

export type Message = {
  conversationId: string;
  createdAt: string;
  id: string;
  senderType: "me" | "other";
  text: string;
};
