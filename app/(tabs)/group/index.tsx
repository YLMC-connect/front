import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  FloatingActionButton,
  SegmentedTabs,
  VisualCover,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { GROUP_CATEGORIES } from "../../../src/constants/domainOptions";
import { useGroupOverview } from "../../../src/hooks/useGroups";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { GroupOverviewItem } from "../../../src/types/group";

const sections = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
] as const;

const sectionHrefs = {
  groups: "/group",
  service: "/group?section=service",
} as const;
export default function GroupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    section?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useGroupOverview();
  const [category, setCategory] =
    useState<(typeof GROUP_CATEGORIES)[number]["key"]>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMyFull, setShowMyFull] = useState(false);
  const section = params.section === "service" ? "service" : "groups";
  const isMyFull = variant === "my-full";
  const isError = variant === "network-error" || overview.isError;
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const matchesSearch = (name: string, description: string) =>
    !normalizedSearch ||
    name.toLocaleLowerCase().includes(normalizedSearch) ||
    description.toLocaleLowerCase().includes(normalizedSearch);
  const groups = (overview.data?.groups ?? []).filter(
    (group) =>
      (category === "all" || group.category === category) &&
      matchesSearch(group.name, group.description),
  );
  const serviceItems = (overview.data?.services ?? []).filter((item) =>
    matchesSearch(item.name, item.description),
  );
  const myGroups = isError ? [] : groups.filter((group) => group.isJoined);
  const isLoading = overview.isPending && !isError;

  if (isMyFull || showMyFull) {
    return (
      <Screen scroll={false} padded={false} testID="screen-group">
        <View style={styles.root}>
          <View style={styles.topBar}>
            <Text style={styles.title}>내 소모임</Text>
            <Pressable
              accessibilityLabel="내 소모임 닫기"
              accessibilityRole="button"
              onPress={() => (isMyFull ? router.back() : setShowMyFull(false))}
              style={styles.searchButton}
            >
              <MaterialIcons
                name="close"
                size={22}
                color={theme.colors.inkSoft}
              />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.fullList}>
            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : (
              myGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => router.push(`/group/${group.id}`)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false} testID="screen-group">
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Text style={styles.title}>동행</Text>
          <Pressable
            accessibilityLabel={searchOpen ? "동행 검색 닫기" : "동행 검색"}
            accessibilityRole="button"
            onPress={() => {
              setSearchOpen((open) => !open);
              if (searchOpen) setSearch("");
            }}
            style={styles.searchButton}
          >
            <MaterialIcons
              name={searchOpen ? "close" : "search"}
              size={22}
              color={theme.colors.inkSoft}
            />
          </Pressable>
        </View>

        {searchOpen ? (
          <View style={styles.searchWrap}>
            <MaterialIcons
              name="search"
              size={19}
              color={theme.colors.inkMute}
            />
            <TextInput
              autoFocus
              accessibilityLabel="동행 검색어"
              value={search}
              onChangeText={setSearch}
              placeholder="소모임 또는 봉사 검색"
              placeholderTextColor={theme.colors.inkMute}
              style={styles.searchInput}
            />
          </View>
        ) : null}

        <SegmentedTabs
          items={sections}
          active={section}
          onChange={(nextSection) => router.replace(sectionHrefs[nextSection])}
          style={styles.segmented}
          testIDPrefix="group-section"
        />

        <ScrollView contentContainerStyle={styles.body}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : isError ? (
            <ErrorState
              message="네트워크 연결을 확인하고 다시 시도해주세요."
              onRetry={() => overview.refetch()}
            />
          ) : section === "service" ? (
            <View style={styles.serviceList}>
              {serviceItems.length === 0 ? (
                <EmptyState
                  title="검색 결과가 없어요"
                  description="다른 검색어로 다시 찾아보세요."
                />
              ) : (
                serviceItems.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => router.push(`/group/${item.linkedGroupId}`)}
                  >
                    <Card style={styles.serviceCard}>
                      <View style={styles.serviceRow}>
                        <VisualThumb
                          size={62}
                          seed={item.coverSeed}
                          icon="volunteer-activism"
                        />
                        <View style={styles.serviceBody}>
                          <View style={styles.serviceMetaRow}>
                            <Badge>{item.statusLabel}</Badge>
                            <Text style={styles.serviceSchedule}>
                              {item.schedule}
                            </Text>
                          </View>
                          <Text style={styles.serviceTitle}>{item.name}</Text>
                          <Text style={styles.serviceDesc}>
                            {item.description}
                          </Text>
                          <Text style={styles.serviceCount}>
                            참여 {item.currentMembers}/{item.maxMembers}명
                          </Text>
                        </View>
                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          color={theme.colors.inkMute}
                        />
                      </View>
                    </Card>
                  </Pressable>
                ))
              )}
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>내 소모임</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowMyFull(true)}
                    style={styles.moreButton}
                  >
                    <Text style={styles.moreText}>전체보기</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mineList}
                  style={styles.mineScroll}
                  snapToInterval={226}
                  decelerationRate="fast"
                >
                  {myGroups.map((group) => (
                    <Pressable
                      key={group.id}
                      accessibilityRole="button"
                      style={styles.mineCard}
                      onPress={() => router.push(`/group/${group.id}`)}
                    >
                      <VisualCover height={78} seed={group.coverSeed} />
                      <Text numberOfLines={1} style={styles.mineTitle}>
                        {group.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.mineMeta}>
                        멤버 {group.currentMembers}명 ·{" "}
                        {categoryOf(group.category)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.allSectionTitle}>전체 모임</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categories}
                  style={styles.categoryScroll}
                >
                  {GROUP_CATEGORIES.map((item) => {
                    const selected = item.key === category;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setCategory(item.key)}
                        key={item.key}
                        style={[styles.chip, selected ? styles.chipOn : null]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected ? styles.chipTextOn : null,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.groupList}>
                  {groups.length === 0 ? (
                    <EmptyState
                      title="검색 결과가 없어요"
                      description="카테고리나 검색어를 바꿔보세요."
                    />
                  ) : (
                    groups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        onPress={() => router.push(`/group/${group.id}`)}
                      />
                    ))
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <FloatingActionButton
          label="개설"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/group-new")}
        />
      </View>
    </Screen>
  );
}

function GroupCard({
  group,
  onPress,
}: {
  group: GroupOverviewItem;
  onPress: () => void;
}) {
  const closed = group.status === "closed";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.groupCard, closed ? styles.closedCard : null]}
    >
      <View style={styles.cardTop}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {group.name}
        </Text>
        <RecruitBadge closed={closed} />
      </View>
      <View style={styles.categoryPill}>
        <Text style={styles.categoryPillText}>
          {categoryOf(group.category)}
        </Text>
      </View>
      <Text numberOfLines={2} style={styles.desc}>
        {group.description}
      </Text>
      <View style={styles.memberRow}>
        <MaterialIcons name="groups" size={14} color={theme.colors.inkMute} />
        <Text style={styles.memberText}>
          현재 <Text style={styles.memberCount}>{group.currentMembers}</Text> /
          최대 {group.maxMembers}
        </Text>
      </View>
    </Pressable>
  );
}

function RecruitBadge({ closed }: { closed: boolean }) {
  return (
    <View style={[styles.badge, closed ? styles.badgeClosed : null]}>
      <Text style={[styles.badgeText, closed ? styles.badgeTextClosed : null]}>
        {closed ? "모집완료" : "모집중"}
      </Text>
    </View>
  );
}

function categoryOf(key: string) {
  return (
    GROUP_CATEGORIES.find((category) => category.key === key)?.label ?? "기타"
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.extrabold,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    minHeight: 46,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  segmented: {
    marginHorizontal: 18,
    marginBottom: 10,
  },
  body: {
    paddingBottom: 164,
  },
  section: {
    marginTop: 6,
  },
  sectionHead: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  allSectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  moreText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  moreButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
    marginVertical: -8,
  },
  mineScroll: {
    flexGrow: 0,
  },
  mineList: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    gap: 12,
  },
  mineCard: {
    width: 214,
    flexShrink: 0,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
    ...theme.shadow.card,
  },
  mineTitle: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  mineMeta: {
    marginTop: 5,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  categories: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.white,
  },
  groupList: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  serviceList: {
    marginHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  serviceCard: {
    padding: 16,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  serviceBody: {
    flex: 1,
    minWidth: 0,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  serviceSchedule: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  serviceTitle: {
    marginTop: 7,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
  },
  serviceDesc: {
    marginTop: 5,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  serviceCount: {
    marginTop: 8,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  fullList: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 12,
  },
  loading: {
    paddingTop: 80,
    alignItems: "center",
  },
  groupCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.card,
  },
  closedCard: {
    opacity: 0.5,
  },
  cardTop: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    lineHeight: 22,
    fontWeight: theme.fontWeight.bold,
  },
  badge: {
    flexShrink: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(143,168,130,0.20)",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeClosed: {
    backgroundColor: "rgba(30,41,32,0.06)",
  },
  badgeText: {
    color: "#4F6B45",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  badgeTextClosed: {
    color: theme.colors.inkMute,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  desc: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 21,
  },
  memberRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  memberCount: {
    color: theme.colors.primaryDeep,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
  },
});
