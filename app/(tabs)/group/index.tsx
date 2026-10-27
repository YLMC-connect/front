import { AppIcon } from "@/components/ui/app-icon";
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  type NativeStackNavigationProp,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StickyHeaderScreen } from "../../../src/components/layout/StickyHeaderScreen";
import {
  AppText,
  Empty,
  ErrorState,
  FilterChips,
  FloatingActionButton,
  ListSkeleton,
  MotionEnter,
  MotionPressable,
  SegmentedTabs,
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

type GroupSection = "groups" | "service" | "mine";

const sections: readonly { key: GroupSection; label: string }[] = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
  { key: "mine", label: "내 모임" },
];

const GROUP_SEGMENT_STICKY_HEIGHT = 60;
const GROUP_STICKY_CONTROLS_HEIGHT = 116;

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
  const listScrollRef = useRef<ScrollView | null>(null);
  const detailNavigationSuspended = useRef(false);
  const detailNavigationWasBlurred = useRef(false);
  const detailNavigationResetDone = useRef(false);
  const [scrollStateResetKey, setScrollStateResetKey] = useState(0);
  const currentScrollY = useRef(0);

  const resetGroupListAfterDetailNavigation = useCallback(() => {
    if (detailNavigationResetDone.current) return;

    detailNavigationResetDone.current = true;
    listScrollRef.current?.scrollTo({ y: 0, animated: false });
    currentScrollY.current = 0;
    setScrollStateResetKey((key) => key + 1);
  }, []);

  const routeSection: GroupSection =
    params.section === "service"
      ? "service"
      : params.section === "mine" || variant === "my-full"
        ? "mine"
        : "groups";
  const routeCategory =
    GROUP_CATEGORIES.find((item) => item.key === params.category)?.key ?? "all";
  const [section, setSection] = useMotionRouteParam<GroupSection>(
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
  const groups = (overview.data?.groups ?? []).filter(
    (group) => category === "all" || group.category === category,
  );
  const serviceItems = overview.data?.services ?? [];
  const myGroups = isError
    ? []
    : (overview.data?.groups ?? []).filter((group) => group.isJoined);
  const isLoading = overview.isPending && !isError;

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
      navigation.dispatch({
        type: "PUSH",
        payload: { name: "[id]", params: { id } },
      });
    },
    [navigation],
  );

  const hasCategoryFilter = section === "groups";

  if (isMyFull) {
    return (
      <StickyHeaderScreen
        contentContainerStyle={styles.fullList}
        scrollRef={listScrollRef}
        scrollStateResetKey={scrollStateResetKey}
        testID="screen-group"
        title="내 모임"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="내 모임 닫기"
            onPress={() => router.back()}
            style={styles.closeButton}
            testID="group-my-list-close"
          >
            <AppIcon name="close" size={22} color={theme.colors.ink} />
          </Pressable>
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={3} thumbnail={false} />
          </View>
        ) : myGroups.length === 0 ? (
          <View style={styles.emptyWrapExpanded}>
            <Empty
              title="참여 중인 소모임이 없어요"
              description="소모임 탭에서 관심 있는 모임에 참여해보세요."
            />
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
      testID="screen-group"
      title="동행"
      subtitle="소모임과 봉사로 함께 걸어가요"
      scrollRef={listScrollRef}
      scrollStateResetKey={scrollStateResetKey}
      stickyControls={
        <View testID="group-sticky-controls-content">
          <SegmentedTabs
            items={sections}
            active={section}
            onChange={setSection}
            style={styles.segmented}
            testIDPrefix="group-section"
          />
          {hasCategoryFilter ? (
            <FilterChips
              items={GROUP_CATEGORIES}
              active={category}
              onChange={setCategory}
              style={styles.categoryScroll}
              testIDPrefix="group-category"
            />
          ) : null}
        </View>
      }
      stickyControlsHeight={
        hasCategoryFilter
          ? GROUP_STICKY_CONTROLS_HEIGHT
          : GROUP_SEGMENT_STICKY_HEIGHT
      }
      stickyControlsHideMode="direction"
      overlay={
        <FloatingActionButton
          label="소모임 개설"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/group-new")}
        />
      }
    >
      <View style={styles.list} testID="group-scroll-content">
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
          serviceItems.length === 0 ? (
            <View style={styles.emptyWrapExpanded}>
              <Empty
                title="등록된 봉사활동이 없어요"
                description="새로운 봉사활동이 등록되면 안내해 드릴게요."
              />
            </View>
          ) : (
            <MotionEnter style={styles.myListWrap}>
              {serviceItems.map((item) => (
                <CompanionCard
                  key={item.id}
                  kind="service"
                  item={item}
                  onPress={() => openGroupDetail(item.linkedGroupId)}
                />
              ))}
            </MotionEnter>
          )
        ) : section === "mine" ? (
          <MotionEnter style={styles.myListWrap} testID="group-my-list">
            {myGroups.length === 0 ? (
              <View style={styles.emptyWrapExpanded}>
                <Empty
                  title="참여 중인 소모임이 없어요"
                  description="소모임 탭에서 관심 있는 모임에 참여해보세요."
                />
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
          </MotionEnter>
        ) : groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Empty
              title="등록된 소모임이 없어요"
              description="소모임을 개설하거나 관심 있는 모임에 참여해보세요."
            />
          </View>
        ) : (
          <MotionEnter style={styles.myListWrap}>
            {groups.map((group) => (
              <CompanionCard
                key={group.id}
                kind="group"
                item={group}
                onPress={() => openGroupDetail(group.id)}
              />
            ))}
          </MotionEnter>
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
    <MotionPressable
      testID={testID}
      accessibilityRole="button"
      onPress={props.onPress}
      pressedScale={0.985}
      style={[styles.groupCard, closed ? styles.closedCard : null]}
    >
      <VisualThumb
        size={theme.layout.listThumb}
        seed={props.item.coverSeed}
        icon={isService ? "groups" : undefined}
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
            <AppIcon name="groups" size={14} color={theme.colors.inkMute} />
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
    </MotionPressable>
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
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  segmented: {
    flexShrink: 0,
    height: 40,
    marginHorizontal: theme.layout.screenX,
    marginTop: 4,
    marginBottom: theme.spacing[3],
  },
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 44,
    marginBottom: theme.spacing[2],
  },
  list: {
    flex: 1,
    paddingBottom: 164,
  },
  myListWrap: {
    flex: 1,
  },
  fullList: {
    paddingBottom: theme.spacing[6],
  },
  loading: {
    paddingTop: theme.spacing[2],
  },
  groupCard: {
    flexDirection: "row",
    gap: theme.layout.listGap,
    marginHorizontal: theme.layout.screenX,
    minHeight: 120,
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
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
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeClosed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  badgeText: {
    color: theme.colors.primaryDeep,
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
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 100,
  },
  emptyWrapExpanded: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 100,
  },
});
