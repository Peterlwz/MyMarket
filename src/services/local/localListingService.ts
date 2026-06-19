import {
  createLocalListingId,
  deleteLocalListing,
  readLocalListings,
  readLocalListingById,
  saveLocalListing,
  setLocalListingStatus,
  updateLocalListing
} from "@/storage/listings";
import type { CreateListingInput, ListingStatus, ListingType, UpdateListingInput } from "@/types/api";
import type { Listing } from "@/types/listing";
import { getListingImages } from "@/utils/listingImages";

import { deleteListingImages, getDefaultImageForType, persistListingImageUris } from "./localImageService";
import type { StoredListing } from "../types";

export async function getListings(): Promise<Array<StoredListing>> {
  return readLocalListings();
}

export async function getMyListings(): Promise<Array<StoredListing>> {
  return getListings();
}

export function createListingId(type: ListingType) {
  return createLocalListingId(type);
}

async function normalizeListingImages(listing: Listing) {
  const fallbackImage = getDefaultImageForType(listing.type);
  const requestedImages = getListingImages(listing);
  const normalizedImages = requestedImages.length
    ? await persistListingImageUris(requestedImages, listing.id)
    : [fallbackImage];
  const finalImages = normalizedImages.length ? normalizedImages : [fallbackImage];

  return {
    ...listing,
    image: finalImages[0],
    images: finalImages
  } as Listing;
}

export async function createListing(input: CreateListingInput): Promise<StoredListing> {
  return saveLocalListing(await normalizeListingImages(input));
}

export async function updateListing(id: string, patch: UpdateListingInput): Promise<StoredListing | undefined> {
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
  const normalizedListing = await normalizeListingImages(nextListing);
  const nextImages = new Set(getListingImages(normalizedListing));
  const removedImages = getListingImages(existingListing).filter((imageUri) => !nextImages.has(imageUri));
  const updatedListing = await updateLocalListing(id, normalizedListing);

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
