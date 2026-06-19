import type { Listing } from "@/types/listing";

export function matchesListingSearch(listing: Listing, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const searchableText = [
    listing.title,
    listing.description,
    listing.location,
    listing.type === "rent" ? listing.district : ""
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedKeyword);
}
