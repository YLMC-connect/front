import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "../../../src/components/layout/Screen";
import {
  EmptyState,
  ErrorState,
  HorizontalChips,
  SegmentedTabs,
  TextField,
  TopBar,
} from "../../../src/components/ui";
import { MarketItemCard } from "../../../src/components/market/MarketItemCard";
import {
  MARKET_CATEGORIES,
  MARKET_STATUS_TABS,
} from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import { useMarketItems } from "../../../src/hooks/useMarketItems";
import type { MarketCategory, MarketStatus } from "../../../src/types/market";

type StatusFilter = MarketStatus | "all";

export default function MarketScreen() {
  const [category, setCategory] = useState<MarketCategory>("all");
  const [status, setStatus] = useState<StatusFilter>("sharing");
  const [keyword, setKeyword] = useState("");
  const { data = [], isLoading, isError } = useMarketItems(category);
  const normalizedKeyword = keyword.trim().toLowerCase();
  const list = data.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      [
        item.title,
        item.description,
        item.condition,
        item.location,
        item.owner.name,
      ].some((value) => value.toLowerCase().includes(normalizedKeyword));
    return matchesStatus && matchesKeyword;
  });

  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-market"
        title="나눔"
        subtitle="성도 간 무료 나눔"
        right={
          <Link href="/modal/market-new" asChild>
            <Pressable style={styles.iconButton}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </Pressable>
          </Link>
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={MARKET_STATUS_TABS}
          active={status}
          onChange={setStatus}
        />
      </View>
      <View style={styles.searchWrap}>
        <TextField
          value={keyword}
          onChangeText={setKeyword}
          placeholder="나눔 물품, 장소, 성도 이름 검색"
        />
      </View>
      <HorizontalChips
        items={MARKET_CATEGORIES}
        active={category}
        onChange={setCategory}
      />
      <View style={styles.list}>
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <Text style={styles.loading}>나눔을 불러오는 중입니다.</Text>
        ) : list.length === 0 ? (
          <EmptyState
            title="진행 중인 나눔이 없습니다"
            description="첫 나눔을 시작해보세요."
            icon="redeem"
          />
        ) : (
          list.map((item) => <MarketItemCard key={item.id} item={item} />)
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 4 },
  searchWrap: { paddingHorizontal: 18 },
  list: { paddingHorizontal: 18, gap: 12 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  loading: { color: theme.colors.inkMute, padding: 18 },
});
