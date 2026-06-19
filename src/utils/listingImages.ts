import type { Listing } from "@/types/listing";

export function getListingImages(listing: Listing) {
  const savedImages = listing.images?.filter((uri) => Boolean(uri.trim())) ?? [];

  if (savedImages.length > 0) {
    return savedImages;
  }

  return listing.image ? [listing.image] : [];
}

export function getListingCoverImage(listing: Listing) {
  return getListingImages(listing)[0] ?? "";
}
