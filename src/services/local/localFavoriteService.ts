import { readFavoriteListingIds, writeFavoriteListingIds } from "@/storage/favorites";

export async function getFavoriteIds() {
  return readFavoriteListingIds();
}

export async function toggleFavorite(id: string) {
  const favoriteIds = await getFavoriteIds();
  const nextFavoriteIds = favoriteIds.includes(id)
    ? favoriteIds.filter((favoriteId) => favoriteId !== id)
    : [id, ...favoriteIds];

  await writeFavoriteListingIds(nextFavoriteIds);
  return nextFavoriteIds;
}

export async function removeFavorite(id: string) {
  const favoriteIds = await getFavoriteIds();
  const nextFavoriteIds = favoriteIds.filter((favoriteId) => favoriteId !== id);

  await writeFavoriteListingIds(nextFavoriteIds);
  return nextFavoriteIds;
}
