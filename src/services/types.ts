import type { ImagePickerAsset } from "expo-image-picker";

import type { CreateListingInput, ListingStatus, ListingType, UpdateListingInput } from "@/types/api";
import type { Listing } from "@/types/listing";

export type StoredListing = Listing & {
  createdAt: string;
  ownerId: string;
  updatedAt: string;
};

export type ImageInput = ImagePickerAsset | string;

export type ListingService = {
  createListing: (input: CreateListingInput) => Promise<StoredListing>;
  createListingId: (type: ListingType) => string;
  deleteListing: (id: string) => Promise<void>;
  getListings: () => Promise<Array<StoredListing>>;
  getMyListings: () => Promise<Array<StoredListing>>;
  updateListing: (id: string, patch: UpdateListingInput) => Promise<StoredListing | undefined>;
  updateListingStatus: (id: string, status: ListingStatus) => Promise<void>;
};

export type FavoriteService = {
  getFavoriteIds: () => Promise<Array<string>>;
  removeFavorite: (id: string) => Promise<Array<string>>;
  toggleFavorite: (id: string) => Promise<Array<string>>;
};

export type ImageService = {
  MAX_LISTING_IMAGES: number;
  deleteListingImages: (imageUris: Array<string>) => Promise<void>;
  getDefaultImageForType: (type: ListingType) => string;
  persistImages: (tempUris: Array<ImageInput>, listingId?: string) => Promise<Array<string>>;
};
