import {
  createLocalListingId,
  deleteLocalListing,
  readLocalListings,
  readLocalListingById,
  saveLocalListing,
  setLocalListingStatus,
  updateLocalListing,
  type StoredListing
} from "@/storage/listings";
import type { CreateListingInput, ListingStatus, ListingType, UpdateListingInput } from "@/types/api";
import type { Listing } from "@/types/listing";
import { getListingImages } from "@/utils/listingImages";

import { deleteListingImages } from "./imageService";

export type { StoredListing } from "@/storage/listings";

export async function getListings(): Promise<Array<StoredListing>> {
  return readLocalListings();
}

export function createListingId(type: ListingType) {
  return createLocalListingId(type);
}

export async function createListing(input: CreateListingInput) {
  return saveLocalListing(input);
}

export async function updateListing(id: string, patch: UpdateListingInput) {
  const existingListing = await readLocalListingById(id);

  if (!existingListing) {
    return undefined;
  }

  const nextListing = {
    ...existingListing,
    ...patch,
    id: existingListing.id,
    type: existingListing.type
  } as Listing;
  const nextImages = new Set(getListingImages(nextListing));
  const removedImages = getListingImages(existingListing).filter((imageUri) => !nextImages.has(imageUri));
  const updatedListing = await updateLocalListing(id, nextListing);

  if (updatedListing) {
    await deleteListingImages(removedImages);
  }

  return updatedListing;
}

export async function deleteListing(id: string) {
  const existingListing = await readLocalListingById(id);

  await deleteLocalListing(id);

  if (existingListing) {
    await deleteListingImages(getListingImages(existingListing));
  }
}

export async function updateListingStatus(id: string, status: ListingStatus) {
  await setLocalListingStatus(id, status);
}
