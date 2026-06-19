import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { listings as mockListings } from "@/data/mock";
import { favoriteService, isRemoteMode, listingService, type StoredListing } from "@/services";
import { useAuth } from "@/state/AuthContext";
import { colors } from "@/theme/colors";
import type { Listing, ListingStatus } from "@/types/listing";
import { isListingVisibleInFeed } from "@/utils/listingStatus";

type ListingsContextValue = {
  addListing: (listing: Listing) => Promise<StoredListing>;
  allListings: Array<Listing>;
  errorMessage: string;
  favoriteListingIds: Array<string>;
  getListingById: (id: string) => Listing | undefined;
  isReady: boolean;
  isFavorite: (listingId: string) => boolean;
  myListings: Array<StoredListing>;
  removeListing: (id: string) => Promise<void>;
  setListingStatus: (id: string, status: ListingStatus) => Promise<void>;
  showNotice: (message: string) => void;
  toggleFavorite: (listingId: string) => Promise<void>;
  updateListing: (id: string, listing: Listing) => Promise<StoredListing | undefined>;
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { isAuthReady, isAuthenticated, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteListingIds, setFavoriteListingIds] = useState<Array<string>>([]);
  const [feedListings, setFeedListings] = useState<Array<StoredListing>>([]);
  const [isReady, setIsReady] = useState(false);
  const [myListings, setMyListings] = useState<Array<StoredListing>>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isRemoteMode && !isAuthReady) {
      return undefined;
    }

    let isMounted = true;

    setIsReady(false);
    setErrorMessage("");

    Promise.all([
      listingService.getListings(),
      listingService.getMyListings(),
      favoriteService.getFavoriteIds()
    ])
      .then(([items, myItems, favoriteIds]) => {
        if (isMounted) {
          setFeedListings(items);
          setMyListings(myItems);
          setFavoriteListingIds(favoriteIds);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize listings context", error);

        if (isMounted) {
          setErrorMessage("加载失败，请稍后再试");
          setFeedListings([]);
          setFavoriteListingIds([]);
          setMyListings([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, user?.id]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setNotice(""), 1800);
    return () => clearTimeout(timeoutId);
  }, [notice]);

  const visibleMyListings = useMemo(
    () => myListings.filter((listing) => isListingVisibleInFeed(listing.status)),
    [myListings]
  );
  const visibleFeedListings = useMemo(
    () => feedListings.filter((listing) => isListingVisibleInFeed(listing.status)),
    [feedListings]
  );
  const allListings = useMemo<Array<Listing>>(
    () =>
      isRemoteMode
        ? visibleFeedListings
        : [
            ...visibleMyListings,
            ...mockListings.filter((listing) => isListingVisibleInFeed(listing.status))
          ],
    [visibleFeedListings, visibleMyListings]
  );

  const upsertFeedListing = (listing: StoredListing) => {
    setFeedListings((current) => {
      const withoutCurrent = current.filter((item) => item.id !== listing.id);

      if (!isListingVisibleInFeed(listing.status)) {
        return withoutCurrent;
      }

      return [listing, ...withoutCurrent];
    });
  };

  const addListing = async (listing: Listing) => {
    const storedListing = await listingService.createListing(listing);

    setMyListings((current) => [
      storedListing,
      ...current.filter((item) => item.id !== storedListing.id)
    ]);
    upsertFeedListing(storedListing);

    return storedListing;
  };

  const setListingStatus = async (id: string, status: ListingStatus) => {
    await listingService.updateListingStatus(id, status);

    const updatedAt = new Date().toISOString();
    let nextListing: StoredListing | undefined;

    setMyListings((current) =>
      current.map((listing) => {
        if (listing.id !== id) {
          return listing;
        }

        nextListing = { ...listing, status, updatedAt };
        return nextListing;
      })
    );

    setFeedListings((current) => {
      if (!nextListing || !isListingVisibleInFeed(status)) {
        return current.filter((listing) => listing.id !== id);
      }

      return current.map((listing) => (listing.id === id ? nextListing as StoredListing : listing));
    });
  };

  const updateListing = async (id: string, listing: Listing) => {
    const updatedListing = await listingService.updateListing(id, listing);

    if (updatedListing) {
      setMyListings((current) =>
        current.map((item) => (item.id === id ? updatedListing : item))
      );
      upsertFeedListing(updatedListing);
    }

    return updatedListing;
  };

  const removeListing = async (id: string) => {
    await listingService.deleteListing(id);
    setMyListings((current) => current.filter((listing) => listing.id !== id));
    setFeedListings((current) => current.filter((listing) => listing.id !== id));

    if (isFavorite(id)) {
      const nextFavoriteIds = await favoriteService.removeFavorite(id);
      setFavoriteListingIds(nextFavoriteIds);
    }
  };

  const getListingById = (id: string) =>
    myListings.find((listing) => listing.id === id) ??
    feedListings.find((listing) => listing.id === id) ??
    (!isRemoteMode ? mockListings.find((listing) => listing.id === id) : undefined);

  const isFavorite = (listingId: string) => favoriteListingIds.includes(listingId);

  const showNotice = (message: string) => setNotice(message);

  const toggleFavorite = async (listingId: string) => {
    if (isRemoteMode && !isAuthenticated) {
      showNotice("登录后才能收藏");
      router.push("/auth" as never);
      return;
    }

    try {
      const nextFavoriteIds = await favoriteService.toggleFavorite(listingId);
      setFavoriteListingIds(nextFavoriteIds);
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      showNotice(error instanceof Error ? error.message : "操作失败，请稍后再试");
    }
  };

  return (
    <ListingsContext.Provider
      value={{
        addListing,
        allListings,
        errorMessage,
        favoriteListingIds,
        getListingById,
        isReady,
        isFavorite,
        myListings,
        removeListing,
        setListingStatus,
        showNotice,
        toggleFavorite,
        updateListing
      }}
    >
      {children}
      {notice ? (
        <View pointerEvents="none" style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const value = useContext(ListingsContext);

  if (!value) {
    throw new Error("useListings must be used within ListingsProvider.");
  }

  return value;
}

const styles = StyleSheet.create({
  notice: {
    alignSelf: "center",
    backgroundColor: "#202427E6",
    borderRadius: 8,
    bottom: 104,
    minHeight: 44,
    justifyContent: "center",
    left: 24,
    paddingHorizontal: 18,
    position: "absolute",
    right: 24
  },
  noticeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center"
  }
});
