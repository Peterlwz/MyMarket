import type { Listing, ListingStatus as DomainListingStatus } from "@/types/listing";
import type { Message } from "@/types/message";

export type ListingType = Listing["type"];
export type ListingStatus = DomainListingStatus;

export type CreateListingInput = Listing;

export type UpdateListingInput = Partial<Listing>;

export type CreateMessageInput = {
  conversationId: string;
  senderType?: Message["senderType"];
  text: string;
};
