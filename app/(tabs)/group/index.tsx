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
import { GroupCard } from "../../../src/components/group/GroupCard";
import {
  GROUP_CATEGORIES,
  GROUP_STATUS_TABS,
} from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import { useGroups } from "../../../src/hooks/useGroups";
import type { GroupCategory } from "../../../src/types/group";

type StatusFilter = "all" | "open" | "joined" | "favorite";

export default function GroupScreen() {
  const [category, setCategory] = useState<GroupCategory>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { data = [], isLoading, isError } = useGroups(category);
  const normalizedKeyword = keyword.trim().toLowerCase();
  const list = data.filter((group) => {
    const matchesStatus =
      status === "all" ||
      (status === "open" && group.status === "open") ||
      (status === "joined" && group.isJoined) ||
      (status === "favorite" && group.isFavorite);
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      [
        group.name,
        group.description,
        group.schedule,
        group.location,
        group.leader.name,
      ].some((value) => value.toLowerCase().includes(normalizedKeyword));
    return matchesStatus && matchesKeyword;
  });

  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-group"
        title="소모임"
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
          items={GROUP_STATUS_TABS}
          active={status}
          onChange={setStatus}
        />
      </View>
      {showSearch ? (
        <View style={styles.searchWrap}>
          <TextField
            value={keyword}
            onChangeText={setKeyword}
            placeholder="소모임명, 장소, 리더 이름 검색"
          />
        </View>
      ) : null}
      <HorizontalChips
        items={GROUP_CATEGORIES}
        active={category}
        onChange={setCategory}
      />
      <View style={styles.list}>
        {isError ? (
          <ErrorState />
        ) : isLoading ? (
          <Text style={styles.loading}>소모임을 불러오는 중입니다.</Text>
        ) : list.length === 0 ? (
          <EmptyState
            title="소모임이 없습니다"
            description="첫 소모임을 개설해보세요."
            icon="groups"
          />
        ) : (
          list.map((group) => <GroupCard key={group.id} group={group} />)
        )}
      </View>
      <Link href="/modal/group-new" asChild>
        <Pressable style={styles.fab}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.fabText}>개설</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 4 },
  searchWrap: { paddingHorizontal: 18, paddingBottom: 6 },
  list: { paddingHorizontal: 18, gap: 12 },
  loading: { color: theme.colors.inkMute, padding: 18 },
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
});
