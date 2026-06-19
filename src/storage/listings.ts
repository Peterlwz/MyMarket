import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Listing, ListingStatus } from "@/types/listing";

export const LOCAL_LISTINGS_STORAGE_KEY = "nest-market:local-listings:v1";

export type StoredListing = Listing & {
  createdAt: string;
  ownerId: "local-user";
  updatedAt: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeListing = (value: unknown): StoredListing | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    (value.type !== "product" && value.type !== "rent")
  ) {
    return null;
  }

  const fallbackDate = new Date(0).toISOString();
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : fallbackDate;
  const image = typeof value.image === "string" ? value.image : "";
  const images = Array.isArray(value.images)
    ? value.images.filter((uri): uri is string => typeof uri === "string" && Boolean(uri))
    : [];
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : createdAt;
  const status: ListingStatus =
    value.status === "reserved" || value.status === "sold" || value.status === "removed"
      ? value.status
      : value.status === "inactive"
        ? "removed"
        : "active";

  return {
    ...(value as Listing),
    createdAt,
    image: image || images[0] || "",
    images: images.length > 0 ? images : image ? [image] : [],
    ownerId: "local-user",
    status,
    updatedAt
  };
};

export function createLocalListingId(type: Listing["type"]) {
  return `local-${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export async function readLocalListings(): Promise<Array<StoredListing>> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_LISTINGS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      const normalized = normalizeListing(item);
      return normalized ? [normalized] : [];
    });
  } catch {
    return [];
  }
}

async function writeLocalListings(listings: Array<StoredListing>) {
  await AsyncStorage.setItem(LOCAL_LISTINGS_STORAGE_KEY, JSON.stringify(listings));
}

export async function readActiveLocalListings(): Promise<Array<StoredListing>> {
  const listings = await readLocalListings();
  return listings.filter((listing) => listing.status !== "removed");
}

export async function readLocalListingById(id: string): Promise<StoredListing | undefined> {
  const listings = await readLocalListings();
  return listings.find((listing) => listing.id === id);
}

export async function saveLocalListing(listing: Listing): Promise<StoredListing> {
  const now = new Date().toISOString();
  const stored: StoredListing = {
    ...listing,
    createdAt: now,
    ownerId: "local-user",
    status: listing.status ?? "active",
    updatedAt: now
  };
  const existing = await readLocalListings();

  await writeLocalListings([stored, ...existing.filter((item) => item.id !== listing.id)]);

  return stored;
}

export async function setLocalListingStatus(id: string, status: ListingStatus) {
  const now = new Date().toISOString();
  const listings = await readLocalListings();
  const nextListings = listings.map((listing) =>
    listing.id === id ? { ...listing, status, updatedAt: now } : listing
  );

  await writeLocalListings(nextListings);
}

export async function updateLocalListing(id: string, listing: Listing): Promise<StoredListing | undefined> {
  const now = new Date().toISOString();
  const listings = await readLocalListings();
  const existingListing = listings.find((item) => item.id === id);

  if (!existingListing) {
    return undefined;
  }

  const updatedListing: StoredListing = {
    ...listing,
    createdAt: existingListing.createdAt,
    ownerId: "local-user",
    status: listing.status,
    updatedAt: now
  };
  const nextListings = listings.map((item) => (item.id === id ? updatedListing : item));

  await writeLocalListings(nextListings);

  return updatedListing;
}

export async function deleteLocalListing(id: string) {
  const listings = await readLocalListings();

  await writeLocalListings(listings.filter((listing) => listing.id !== id));
}
