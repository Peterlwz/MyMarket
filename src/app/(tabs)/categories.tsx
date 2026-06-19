import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CategoryGrid } from "@/components/CategoryGrid";
import { EmptyState } from "@/components/EmptyState";
import { ListingFeed } from "@/components/ListingFeed";
import { Screen } from "@/components/Screen";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { categories } from "@/data/mock";
import { useListings } from "@/state/ListingsContext";
import { colors } from "@/theme/colors";
import { spacing, typography } from "@/theme/spacing";
import type { CategoryId } from "@/types/listing";
import { matchesListingSearch } from "@/utils/listingFilters";

export default function CategoriesScreen() {
  const { allListings, errorMessage, isReady } = useListings();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<CategoryId>("all");
  const filtered = useMemo(
    () =>
      allListings.filter((listing) => {
        const matchesCategory = selectedId === "all" || listing.categoryId === selectedId;
        return matchesCategory && matchesListingSearch(listing, searchKeyword);
      }),
    [allListings, searchKeyword, selectedId]
  );
  const selectedCategory = categories.find((category) => category.id === selectedId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>分类</Text>
          <Text style={styles.subtitle}>先选类目，再看对应的商品和转租信息</Text>
          <SearchBar
            compact
            onChangeText={setSearchKeyword}
            placeholder="在当前分类里找"
            value={searchKeyword}
          />
        </View>
        <View style={styles.block}>
          <CategoryGrid categories={categories} onSelect={setSelectedId} selectedId={selectedId} />
        </View>
        <SectionHeader meta={`${filtered.length} 条`} title={selectedCategory?.label ?? "全部"} />
        {!isReady ? (
          <EmptyState title="正在加载内容" message="正在读取当前分类下的发布。" />
        ) : errorMessage ? (
          <EmptyState title={errorMessage} message="请检查网络或 Supabase 配置后重试。" />
        ) : filtered.length ? (
          <ListingFeed items={filtered} />
        ) : (
          <EmptyState title="没有找到相关内容" message="当前分类和搜索条件下暂无发布。" />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: spacing.md
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 120,
    paddingTop: 16
  },
  header: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.screenTitle,
    fontWeight: "900"
  }
});
