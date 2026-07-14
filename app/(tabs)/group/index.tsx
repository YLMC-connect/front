import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StickyHeaderScreen } from "../../../src/components/layout/StickyHeaderScreen";
import {
  Badge,
  AppText,
  Card,
  EmptyState,
  ErrorState,
  FilterChips,
  FloatingActionButton,
  ListSkeleton,
  SegmentedTabs,
  VisualCover,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { GROUP_CATEGORIES } from "../../../src/constants/domainOptions";
import { useGroupOverview } from "../../../src/hooks/useGroups";
import { useMotionRouteParam } from "../../../src/hooks/useMotionRouteParam";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { GroupOverviewItem } from "../../../src/types/group";

const sections = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
] as const;

export default function GroupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    section?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useGroupOverview();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMyFull, setShowMyFull] = useState(false);
  const routeSection = params.section === "service" ? "service" : "groups";
  const routeCategory =
    GROUP_CATEGORIES.find((item) => item.key === params.category)?.key ?? "all";
  const [section, setSection] = useMotionRouteParam(
    routeSection,
    (nextSection) => {
      router.setParams({
        section: nextSection === "groups" ? undefined : nextSection,
      });
    },
  );
  const [category, setCategory] = useMotionRouteParam(
    routeCategory,
    (nextCategory) => {
      router.setParams({
        category: nextCategory === "all" ? undefined : nextCategory,
      });
    },
  );
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
      <StickyHeaderScreen
        contentContainerStyle={styles.fullList}
        testID="screen-group"
        title="내 소모임"
        right={
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
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={3} thumbnail={false} />
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
      </StickyHeaderScreen>
    );
  }

  return (
    <StickyHeaderScreen
      contentContainerStyle={styles.body}
      testID="screen-group"
      title="동행"
      right={
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
      }
      overlay={
        <FloatingActionButton
          label="개설"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/group-new")}
        />
      }
    >
      {searchOpen ? (
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={19} color={theme.colors.inkMute} />
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
        onChange={setSection}
        style={styles.segmented}
        testIDPrefix="group-section"
      />

      {isLoading ? (
        <View style={styles.loading}>
          <ListSkeleton rows={4} thumbnail={false} />
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
                      <AppText variant="cardTitle" style={styles.serviceTitle}>
                        {item.name}
                      </AppText>
                      <AppText
                        variant="body"
                        tone="secondary"
                        style={styles.serviceDesc}
                      >
                        {item.description}
                      </AppText>
                      <AppText
                        variant="caption"
                        tone="muted"
                        style={styles.serviceCount}
                      >
                        참여 {item.currentMembers}/{item.maxMembers}명
                      </AppText>
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
              <AppText variant="sectionTitle">내 소모임</AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowMyFull(true)}
                style={styles.moreButton}
              >
                <AppText variant="caption" tone="brand">
                  전체보기
                </AppText>
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
                  <AppText
                    numberOfLines={1}
                    variant="cardTitle"
                    style={styles.mineTitle}
                  >
                    {group.name}
                  </AppText>
                  <AppText
                    numberOfLines={1}
                    variant="caption"
                    tone="muted"
                    style={styles.mineMeta}
                  >
                    멤버 {group.currentMembers}명 · {categoryOf(group.category)}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <AppText variant="sectionTitle" style={styles.allSectionTitle}>
              전체 모임
            </AppText>
            <FilterChips
              items={GROUP_CATEGORIES}
              active={category}
              onChange={setCategory}
              style={styles.categoryScroll}
              testIDPrefix="group-category"
            />
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
    </StickyHeaderScreen>
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
      <VisualThumb size={96} seed={group.coverSeed} />
      <View style={styles.groupCardBody}>
        <View style={styles.cardTop}>
          <AppText
            numberOfLines={1}
            variant="cardTitle"
            style={styles.cardTitle}
          >
            {group.name}
          </AppText>
          <RecruitBadge closed={closed} />
        </View>
        <AppText
          numberOfLines={2}
          variant="body"
          tone="secondary"
          style={styles.desc}
        >
          {group.description}
        </AppText>
        <View style={styles.cardMetaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>
              {categoryOf(group.category)}
            </Text>
          </View>
          <View style={styles.memberRow}>
            <MaterialIcons
              name="groups"
              size={14}
              color={theme.colors.inkMute}
            />
            <AppText variant="caption" tone="muted">
              <Text style={styles.memberCount}>{group.currentMembers}</Text> /
              {group.maxMembers}명
            </AppText>
          </View>
        </View>
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
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    minHeight: 46,
    marginHorizontal: theme.layout.screenX,
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
    flexShrink: 0,
    height: 44,
    marginHorizontal: theme.layout.screenX,
    marginTop: 4,
    marginBottom: theme.layout.listGap,
  },
  body: {
    paddingBottom: 164,
  },
  section: {
    marginTop: theme.spacing[3],
  },
  sectionHead: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allSectionTitle: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
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
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: 6,
    gap: theme.layout.listGap,
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
  },
  mineMeta: {
    marginTop: 5,
  },
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 44,
    marginBottom: theme.layout.listGap,
  },
  groupList: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: 12,
    gap: theme.spacing[3],
  },
  serviceList: {
    marginHorizontal: theme.layout.screenX,
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
  },
  serviceDesc: {
    marginTop: 5,
  },
  serviceCount: {
    marginTop: 8,
  },
  fullList: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: 28,
    gap: 12,
  },
  loading: {
    paddingTop: theme.spacing[2],
  },
  groupCard: {
    flexDirection: "row",
    gap: theme.layout.listGap,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[4],
    ...theme.shadow.card,
  },
  groupCardBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  closedCard: {
    opacity: 0.5,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
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
    marginVertical: 4,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberCount: {
    color: theme.colors.primaryDeep,
  },
  fab: {
    position: "absolute",
    right: theme.layout.screenX,
    bottom: 86,
  },
});
