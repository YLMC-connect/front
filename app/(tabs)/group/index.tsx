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
        subtitle="함께할 성도를 찾아요"
        right={
          <Link href="/modal/group-new" asChild>
            <Pressable style={styles.iconButton}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </Pressable>
          </Link>
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={GROUP_STATUS_TABS}
          active={status}
          onChange={setStatus}
        />
      </View>
      <View style={styles.searchWrap}>
        <TextField
          value={keyword}
          onChangeText={setKeyword}
          placeholder="소모임명, 장소, 리더 이름 검색"
        />
      </View>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 4 },
  searchWrap: { paddingHorizontal: 18 },
  list: { paddingHorizontal: 18, gap: 12 },
  loading: { color: theme.colors.inkMute, padding: 18 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
});
