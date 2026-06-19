import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { CategoryPill } from "@/components/CategoryPill";
import { EmptyState } from "@/components/EmptyState";
import { ListingFeed } from "@/components/ListingFeed";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { categories } from "@/data/mock";
import { useListings } from "@/state/ListingsContext";
import { spacing } from "@/theme/spacing";
import { matchesListingSearch } from "@/utils/listingFilters";

export default function HomeScreen() {
  const { allListings, errorMessage, isReady } = useListings();
  const [searchKeyword, setSearchKeyword] = useState("");
  const filteredListings = useMemo(
    () => allListings.filter((listing) => matchesListingSearch(listing, searchKeyword)),
    [allListings, searchKeyword]
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader onSearchChange={setSearchKeyword} searchValue={searchKeyword} />
        <ScrollView
          contentContainerStyle={styles.categoryRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category, index) => (
            <CategoryPill category={category} key={category.id} selected={index === 0} />
          ))}
        </ScrollView>
        <SectionHeader meta={`${filteredListings.length} 条`} title="附近新发布" />
        {!isReady ? (
          <EmptyState title="正在加载内容" message="正在读取发布信息。" />
        ) : errorMessage ? (
          <EmptyState title={errorMessage} message="请检查网络或 Supabase 配置后重试。" />
        ) : filteredListings.length ? (
          <ListingFeed items={filteredListings} />
        ) : (
          <EmptyState title="没有找到相关内容" message="换个关键词，或者看看其他分类。" />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categoryRow: {
    gap: 10,
    paddingHorizontal: spacing.md
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 120,
    paddingTop: 8
  }
});
