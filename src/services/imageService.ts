import type { ImagePickerAsset } from "expo-image-picker";

import {
  deleteLocalImageFiles,
  MAX_LISTING_IMAGES,
  savePickedImagesForListing
} from "@/storage/images";
import type { ListingType } from "@/types/api";
import { defaultListingImages } from "@/utils/defaultListingImages";

export { MAX_LISTING_IMAGES };

type TempImageInput = ImagePickerAsset | string;

const normalizeTempImage = (image: TempImageInput): ImagePickerAsset =>
  typeof image === "string" ? { height: 0, uri: image, width: 0 } : image;

export async function persistImages(tempUris: Array<TempImageInput>, listingId?: string) {
  const imageOwnerId = listingId ?? `listing-images-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return savePickedImagesForListing(tempUris.map(normalizeTempImage), imageOwnerId);
}

export async function deleteListingImages(imageUris: Array<string>) {
  await deleteLocalImageFiles(imageUris);
}

export function getDefaultImageForType(type: ListingType) {
  return defaultListingImages[type];
}
