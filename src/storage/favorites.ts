import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAVORITE_LISTINGS_STORAGE_KEY = "nest-market:favorite-listing-ids:v1";

export async function readFavoriteListingIds(): Promise<Array<string>> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITE_LISTINGS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string" && Boolean(id));
  } catch {
    return [];
  }
}

export async function writeFavoriteListingIds(ids: Array<string>) {
  await AsyncStorage.setItem(FAVORITE_LISTINGS_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}
