import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { useListings } from "@/state/ListingsContext";
import type { Listing } from "@/types/listing";

import { ListingCard } from "./ListingCard";
import { RentCard } from "./RentCard";

type ListingFeedProps = {
  items: Array<Listing>;
};

export function ListingFeed({ items }: ListingFeedProps) {
  const { isFavorite, toggleFavorite } = useListings();
  const left = items.filter((_, index) => index % 2 === 0);
  const right = items.filter((_, index) => index % 2 === 1);

  return (
    <View style={styles.container}>
      {[left, right].map((column, columnIndex) => (
        <View key={columnIndex} style={styles.column}>
          {column.map((item) =>
            item.type === "rent" ? (
              <RentCard
                isFavorite={isFavorite(item.id)}
                item={item}
                key={item.id}
                onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ) : (
              <ListingCard
                isFavorite={isFavorite(item.id)}
                item={item}
                key={item.id}
                onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: 0
  },
  container: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16
  }
});
