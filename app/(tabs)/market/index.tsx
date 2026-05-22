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
  const [showSearch, setShowSearch] = useState(false);
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
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowSearch((value) => !value)}
            style={styles.headerIcon}
          >
            <MaterialIcons
              name="search"
              size={22}
              color={theme.colors.inkSoft}
            />
          </Pressable>
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={MARKET_STATUS_TABS}
          active={status}
          onChange={setStatus}
        />
      </View>
      {showSearch ? (
        <View style={styles.searchWrap}>
          <TextField
            value={keyword}
            onChangeText={setKeyword}
            placeholder="나눔 물품, 장소, 성도 이름 검색"
          />
        </View>
      ) : null}
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
      <Link href="/modal/market-new" asChild>
        <Pressable style={styles.fab}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.fabText}>글쓰기</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 6 },
  searchWrap: { paddingHorizontal: 18, paddingBottom: 6 },
  list: { paddingHorizontal: 22 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 94,
    zIndex: 20,
    height: 52,
    borderRadius: theme.radius.pill,
    paddingLeft: 16,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.5)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  loading: { color: theme.colors.inkMute, padding: 18 },
});
