import { AppIcon } from "@/components/ui/app-icon";
import { StackActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StickyHeaderScreen } from "../../../src/components/layout/StickyHeaderScreen";
import { useMotionPresence } from "../../../src/components/ui/motion";
import {
  AppText,
  EmptyState,
  ErrorState,
  FilterChips,
  FloatingActionButton,
  ListSkeleton,
  SearchField,
  SEARCH_FIELD_STICKY_HEIGHT,
  SearchToggleButton,
  SegmentedTabs,
  SectionHeader,
  VisualCover,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { GROUP_CATEGORIES } from "../../../src/constants/domainOptions";
import { useGroupOverview } from "../../../src/hooks/useGroups";
import { useMotionRouteParam } from "../../../src/hooks/useMotionRouteParam";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type {
  GroupOverviewItem,
  GroupServiceOverviewItem,
} from "../../../src/types/group";

const sections = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
] as const;

const GROUP_SEGMENT_STICKY_HEIGHT = 60;
const GROUP_COMBINED_STICKY_HEIGHT = 116;
const GROUP_FILTER_TRANSLATE_DISTANCE = 4;

type GroupStackParamList = {
  "[id]": { id: string };
};

export default function GroupScreen() {
  const router = useRouter();
  const navigation =
    useNavigation<NativeStackNavigationProp<GroupStackParamList>>();
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
  const [categoryAnchorY, setCategoryAnchorY] = useState<number | null>(null);
  const [categorySticky, setCategorySticky] = useState(false);
  const [stickyFilterInteractive, setStickyFilterInteractive] = useState(false);
  const listScrollRef = useRef<ScrollView | null>(null);
  const detailNavigationSuspended = useRef(false);
  const detailNavigationWasBlurred = useRef(false);
  const detailNavigationResetDone = useRef(false);
  const [scrollStateResetKey, setScrollStateResetKey] = useState(0);
  const currentScrollY = useRef(0);
  const {
    hideImmediately: hideStickyFilterImmediately,
    mounted: stickyFilterMounted,
    progress: categoryDockProgress,
    reduceMotion,
  } = useMotionPresence(categorySticky, {
    duration: theme.motion.duration.base,
  });
  const contentFilterAnimatedStyle = useAnimatedStyle(() => {
    const dockProgress = categoryDockProgress.value;

    return {
      opacity: 1 - dockProgress,
      transform: [
        {
          translateY:
            dockProgress === 0
              ? 0
              : -GROUP_FILTER_TRANSLATE_DISTANCE * dockProgress,
        },
      ],
    };
  });
  const stickyFilterAnimatedStyle = useAnimatedStyle(() => {
    const dockProgress = categoryDockProgress.value;

    return {
      opacity: dockProgress,
      transform: [
        {
          translateY: GROUP_FILTER_TRANSLATE_DISTANCE * (1 - dockProgress),
        },
      ],
    };
  });
  const resetGroupListAfterDetailNavigation = useCallback(() => {
    if (detailNavigationResetDone.current) return;

    detailNavigationResetDone.current = true;
    listScrollRef.current?.scrollTo({ y: 0, animated: false });
    currentScrollY.current = 0;
    setCategorySticky(false);
    setStickyFilterInteractive(false);
    hideStickyFilterImmediately();
    setScrollStateResetKey((key) => key + 1);
  }, [hideStickyFilterImmediately]);
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
  const searchedGroups = (overview.data?.groups ?? []).filter((group) =>
    matchesSearch(group.name, group.description),
  );
  const groups = searchedGroups.filter(
    (group) => category === "all" || group.category === category,
  );
  const serviceItems = (overview.data?.services ?? []).filter((item) =>
    matchesSearch(item.name, item.description),
  );
  const myGroups = isError
    ? []
    : searchedGroups.filter((group) => group.isJoined);
  const isLoading = overview.isPending && !isError;

  const updateCategoryDockState = useCallback(
    (offsetY: number, anchorY = categoryAnchorY) => {
      if (detailNavigationSuspended.current) return;

      const activeAnchorY = section === "groups" ? anchorY : null;
      const nextSticky = activeAnchorY !== null && offsetY >= activeAnchorY;

      setCategorySticky((current) =>
        current === nextSticky ? current : nextSticky,
      );
    },
    [categoryAnchorY, section],
  );

  useEffect(() => {
    updateCategoryDockState(currentScrollY.current);
  }, [updateCategoryDockState]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener("blur", () => {
      if (detailNavigationSuspended.current) {
        detailNavigationWasBlurred.current = true;
        if (Platform.OS === "web") {
          resetGroupListAfterDetailNavigation();
        }
      }
    });
    const unsubscribeTransitionEnd = navigation.addListener(
      "transitionEnd",
      (event) => {
        if (
          Platform.OS !== "web" &&
          event.data.closing &&
          detailNavigationSuspended.current
        ) {
          resetGroupListAfterDetailNavigation();
        }
      },
    );
    const unsubscribeFocus = navigation.addListener("focus", () => {
      if (
        detailNavigationSuspended.current &&
        detailNavigationWasBlurred.current
      ) {
        detailNavigationSuspended.current = false;
        detailNavigationWasBlurred.current = false;
        detailNavigationResetDone.current = false;
      }
    });

    return () => {
      unsubscribeBlur();
      unsubscribeTransitionEnd();
      unsubscribeFocus();
    };
  }, [navigation, resetGroupListAfterDetailNavigation]);

  useEffect(() => {
    if (reduceMotion) {
      setStickyFilterInteractive(categorySticky);
      return;
    }

    const interactiveTimer = setTimeout(
      () => setStickyFilterInteractive(categorySticky),
      theme.motion.duration.base / 2,
    );

    return () => clearTimeout(interactiveTimer);
  }, [categorySticky, reduceMotion]);

  const handleScrollOffsetChange = (offsetY: number) => {
    currentScrollY.current = offsetY;
    updateCategoryDockState(offsetY);
  };
  const shouldHandleGroupScroll = useCallback(
    () => !detailNavigationSuspended.current,
    [],
  );
  const openGroupDetail = useCallback(
    (id: string) => {
      if (detailNavigationSuspended.current) return;

      detailNavigationSuspended.current = true;
      detailNavigationWasBlurred.current = false;
      detailNavigationResetDone.current = false;
      if (Platform.OS === "web") {
        listScrollRef.current?.scrollTo({ y: 0, animated: false });
        currentScrollY.current = 0;
      }
      navigation.dispatch(StackActions.push("[id]", { id }));
    },
    [navigation],
  );
  const showStickyFilter = section === "groups" && stickyFilterMounted;

  if (isMyFull || showMyFull) {
    return (
      <StickyHeaderScreen
        contentContainerStyle={styles.fullList}
        scrollRef={listScrollRef}
        scrollStateResetKey={scrollStateResetKey}
        testID="screen-group"
        title="내 소모임"
        right={
          <SearchToggleButton
            accessibilityLabel="내 소모임 닫기"
            onPress={() => (isMyFull ? router.back() : setShowMyFull(false))}
            open
            testID="group-my-list-close"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={3} thumbnail={false} />
          </View>
        ) : (
          myGroups.map((group) => (
            <CompanionCard
              key={group.id}
              kind="group"
              item={group}
              onPress={() => openGroupDetail(group.id)}
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
      subtitle="소모임과 봉사로 함께 걸어가요"
      onScrollOffsetChange={handleScrollOffsetChange}
      scrollRef={listScrollRef}
      scrollStateResetKey={scrollStateResetKey}
      shouldHandleScroll={shouldHandleGroupScroll}
      stickyControls={
        <View testID="group-sticky-controls-content">
          {searchOpen ? (
            <SearchField
              autoFocus
              accessibilityLabel="동행 검색어"
              value={search}
              onChangeText={setSearch}
              placeholder="소모임 또는 봉사 검색"
              testID="group-search-field"
            />
          ) : null}
          <SegmentedTabs
            items={sections}
            active={section}
            onChange={setSection}
            style={styles.segmented}
            testIDPrefix="group-section"
          />
          {showStickyFilter ? (
            <Animated.View
              accessibilityElementsHidden={!stickyFilterInteractive}
              importantForAccessibility={
                stickyFilterInteractive ? "auto" : "no-hide-descendants"
              }
              pointerEvents={stickyFilterInteractive ? "auto" : "none"}
              style={stickyFilterAnimatedStyle}
              testID="group-sticky-controls-filter"
            >
              <FilterChips
                items={GROUP_CATEGORIES}
                active={category}
                onChange={setCategory}
                style={styles.categoryScroll}
                testIDPrefix="group-sticky-category"
              />
            </Animated.View>
          ) : null}
        </View>
      }
      stickyControlsHeight={
        (showStickyFilter
          ? GROUP_COMBINED_STICKY_HEIGHT
          : GROUP_SEGMENT_STICKY_HEIGHT) +
        (searchOpen ? SEARCH_FIELD_STICKY_HEIGHT : 0)
      }
      stickyControlsCollapsedHeight={
        GROUP_SEGMENT_STICKY_HEIGHT +
        (searchOpen ? SEARCH_FIELD_STICKY_HEIGHT : 0)
      }
      stickyControlsHeightProgress={categoryDockProgress}
      stickyControlsInset={
        GROUP_SEGMENT_STICKY_HEIGHT +
        (searchOpen ? SEARCH_FIELD_STICKY_HEIGHT : 0)
      }
      stickyControlsAlwaysVisible={searchOpen}
      stickyControlsRevealKey={
        showStickyFilter ? "segment-with-filter" : "segment-only"
      }
      right={
        <SearchToggleButton
          accessibilityLabel={searchOpen ? "동행 검색 닫기" : "동행 검색"}
          onPress={() => {
            setSearchOpen((open) => !open);
            if (searchOpen) setSearch("");
          }}
          open={searchOpen}
          testID="group-search-toggle"
        />
      }
      overlay={
        <FloatingActionButton
          label="소모임 개설"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/group-new")}
        />
      }
    >
      <View testID="group-scroll-content">
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
                <CompanionCard
                  key={item.id}
                  kind="service"
                  item={item}
                  onPress={() => openGroupDetail(item.linkedGroupId)}
                />
              ))
            )}
          </View>
        ) : (
          <>
            <View testID="group-my-section">
              <SectionHeader
                title="내 소모임"
                onViewAll={() => setShowMyFull(true)}
                style={styles.sectionHead}
                testID="group-my-section-header"
              />
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
                    onPress={() => openGroupDetail(group.id)}
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
                      멤버 {group.currentMembers}명 ·{" "}
                      {categoryOf(group.category)}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.allSectionHeader}>
              <AppText variant="sectionTitle" style={styles.allSectionTitle}>
                전체 모임
              </AppText>
            </View>
            <View
              onLayout={(event) => {
                if (detailNavigationSuspended.current) return;

                const {
                  height,
                  width,
                  y: nextAnchorY,
                } = event.nativeEvent.layout;
                if (width <= 0 || height <= 0) return;

                setCategoryAnchorY(nextAnchorY);
                updateCategoryDockState(currentScrollY.current, nextAnchorY);
              }}
              style={styles.categoryAnchor}
              testID="group-category-anchor"
            >
              <Animated.View
                accessibilityElementsHidden={stickyFilterInteractive}
                importantForAccessibility={
                  stickyFilterInteractive ? "no-hide-descendants" : "auto"
                }
                pointerEvents={stickyFilterInteractive ? "none" : "auto"}
                style={contentFilterAnimatedStyle}
                testID="group-content-filter"
              >
                <FilterChips
                  items={GROUP_CATEGORIES}
                  active={category}
                  onChange={setCategory}
                  style={styles.categoryScroll}
                  testIDPrefix="group-category"
                />
              </Animated.View>
            </View>
            <View style={styles.groupList}>
              {groups.length === 0 ? (
                <EmptyState
                  title="검색 결과가 없어요"
                  description="카테고리나 검색어를 바꿔보세요."
                />
              ) : (
                groups.map((group) => (
                  <CompanionCard
                    key={group.id}
                    kind="group"
                    item={group}
                    onPress={() => openGroupDetail(group.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </View>
    </StickyHeaderScreen>
  );
}

function CompanionCard(
  props:
    | {
        kind: "group";
        item: GroupOverviewItem;
        onPress: () => void;
      }
    | {
        kind: "service";
        item: GroupServiceOverviewItem;
        onPress: () => void;
      },
) {
  const isService = props.kind === "service";
  const closed = props.kind === "group" && props.item.status === "closed";
  const testID = isService
    ? `group-service-card-${props.item.id}`
    : `group-card-${props.item.id}`;
  const statusLabel = isService
    ? props.item.statusLabel
    : closed
      ? "모집완료"
      : "모집중";
  const metaLabel = isService
    ? props.item.schedule
    : categoryOf(props.item.category);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={props.onPress}
      style={[styles.groupCard, closed ? styles.closedCard : null]}
    >
      <VisualThumb
        size={96}
        seed={props.item.coverSeed}
        icon={isService ? "volunteer-activism" : undefined}
      />
      <View style={styles.groupCardBody}>
        <View style={styles.cardTop}>
          <AppText
            numberOfLines={1}
            variant="cardTitle"
            style={styles.cardTitle}
          >
            {props.item.name}
          </AppText>
          <StatusBadge
            label={statusLabel}
            muted={isService ? props.item.statusLabel !== "모집중" : closed}
          />
        </View>
        <AppText
          numberOfLines={2}
          variant="body"
          tone="secondary"
          style={styles.desc}
        >
          {props.item.description}
        </AppText>
        <View style={styles.cardMetaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{metaLabel}</Text>
          </View>
          <View testID={`${testID}-member-count`} style={styles.memberRow}>
            <AppIcon
              name={isService ? "volunteer-activism" : "groups"}
              size={14}
              color={theme.colors.inkMute}
            />
            <AppText variant="caption" tone="muted">
              {isService ? "참여 " : null}
              <Text style={styles.memberCount}>
                {props.item.currentMembers}
              </Text>{" "}
              /{props.item.maxMembers}명
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function StatusBadge({ label, muted }: { label: string; muted: boolean }) {
  return (
    <View style={[styles.badge, muted ? styles.badgeClosed : null]}>
      <Text style={[styles.badgeText, muted ? styles.badgeTextClosed : null]}>
        {label}
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
  segmented: {
    flexShrink: 0,
    height: 40,
    marginHorizontal: theme.layout.screenX,
    marginTop: 4,
    marginBottom: 16,
  },
  body: {
    paddingBottom: 164,
  },
  allSectionHeader: {
    marginTop: theme.spacing[3],
  },
  sectionHead: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: theme.spacing[3],
  },
  allSectionTitle: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
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
  categoryAnchor: {
    height: GROUP_COMBINED_STICKY_HEIGHT - GROUP_SEGMENT_STICKY_HEIGHT,
  },
  groupList: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: 12,
    gap: theme.spacing[3],
  },
  serviceList: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 6,
    paddingBottom: 12,
    gap: theme.spacing[3],
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
    minHeight: 133,
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
