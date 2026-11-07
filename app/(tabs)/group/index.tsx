import { AppIcon } from "@/components/ui/app-icon";
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  type NativeStackNavigationProp,
} from "expo-router";
import { ListRow } from "@/components/ui/list-row";
import { motionStaggerDelay } from "@/components/ui/motion";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { StickyHeaderScreen } from "../../../src/components/layout/StickyHeaderScreen";
import {
  AppText,
  Badge,
  Empty,
  ErrorState,
  FilterChips,
  FloatingActionButton,
  ListSkeleton,
  MotionEnter,
  SegmentedTabs,
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
import { useScaleHeightForFont } from "../../../src/lib/fontScale";

type GroupSection = "groups" | "service" | "mine";

const sections: readonly { key: GroupSection; label: string }[] = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
  { key: "mine", label: "내 모임" },
];

const GROUP_SEGMENT_STICKY_HEIGHT = 60;
/** 첫 진입 때 순서대로 떠오르는 행 수(디자인 시스템 ListRow: 처음 8개, 60ms 간격). */
const STAGGER_LIMIT = 8;
const GROUP_STICKY_CONTROLS_HEIGHT = 116;

type GroupStackParamList = {
  "[id]": { id: string };
};

export default function GroupScreen() {
  // 글자 크기 설정이 크면 상단 고정 영역 높이도 함께 키운다 (Issue 258)
  const scaleForFont = useScaleHeightForFont();
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
  const isCurrentSectionEmpty =
    section === "service"
      ? serviceItems.length === 0
      : section === "mine"
        ? myGroups.length === 0
        : groups.length === 0;

  if (isMyFull) {
    return (
      <StickyHeaderScreen
        contentContainerStyle={styles.fullList}
        scrollRef={listScrollRef}
        scrollStateResetKey={scrollStateResetKey}
        refreshing={overview.isRefetching}
        onRefresh={() => void overview.refetch()}
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
            <AppIcon name="close" size={22} color={theme.colors.text} />
          </Pressable>
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={3} thumbnail={false} />
          </View>
        ) : myGroups.length === 0 ? (
          <Empty
            icon="groups"
            title="참여 중인 소모임이 없어요"
            description="관심 있는 소모임에 참여해보세요."
          />
        ) : (
          myGroups.map((group, index) => (
            <StaggerItem key={group.id} index={index}>
              <CompanionCard
                kind="group"
                item={group}
                onPress={() => openGroupDetail(group.id)}
              />
            </StaggerItem>
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
      refreshing={overview.isRefetching}
      onRefresh={() => void overview.refetch()}
      onEndReached={() => {
        if (
          section === "groups" &&
          overview.hasNextPage &&
          !overview.isFetchingNextPage
        ) {
          void overview.fetchNextPage();
        }
      }}
      stickyControls={
        <View testID="group-sticky-controls-content">
          <SegmentedTabs
            items={sections}
            active={section}
            onChange={setSection}
            style={[styles.segmented, { height: scaleForFont(40) }]}
            testIDPrefix="group-section"
          />
          {hasCategoryFilter ? (
            <FilterChips
              items={GROUP_CATEGORIES}
              active={category}
              onChange={setCategory}
              style={[styles.categoryScroll, { height: scaleForFont(44) }]}
              testIDPrefix="group-category"
            />
          ) : null}
        </View>
      }
      stickyControlsHeight={scaleForFont(
        hasCategoryFilter
          ? GROUP_STICKY_CONTROLS_HEIGHT
          : GROUP_SEGMENT_STICKY_HEIGHT,
      )}
      stickyControlsHideMode="direction"
      overlay={
        <FloatingActionButton
          label="소모임 개설"
          icon="add"
          onPress={() => router.push("/modal/group-new")}
        />
      }
    >
      <View
        style={[
          styles.list,
          !isLoading && (isError || isCurrentSectionEmpty)
            ? styles.listEmpty
            : null,
        ]}
        testID="group-scroll-content"
      >
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
            <Empty
              icon="groups"
              title="등록된 봉사활동이 없어요"
              description="새로운 봉사활동이 등록되면 안내해 드릴게요."
            />
          ) : (
            <View style={styles.myListWrap}>
              {serviceItems.map((item, index) => (
                <StaggerItem key={item.id} index={index}>
                  <CompanionCard
                    kind="service"
                    item={item}
                    onPress={() => openGroupDetail(item.linkedGroupId)}
                  />
                </StaggerItem>
              ))}
            </View>
          )
        ) : section === "mine" ? (
          <View style={styles.myListWrap} testID="group-my-list">
            {myGroups.length === 0 ? (
              <Empty
                icon="groups"
                title="참여 중인 소모임이 없어요"
                description="관심 있는 소모임에 참여해보세요."
              />
            ) : (
              myGroups.map((group, index) => (
                <StaggerItem key={group.id} index={index}>
                  <CompanionCard
                    kind="group"
                    item={group}
                    onPress={() => openGroupDetail(group.id)}
                  />
                </StaggerItem>
              ))
            )}
          </View>
        ) : groups.length === 0 ? (
          <Empty
            icon="groups"
            title="등록된 소모임이 없어요"
            description="소모임을 개설하거나 관심 있는 모임에 참여해보세요."
          />
        ) : (
          <View style={styles.myListWrap}>
            {groups.map((group, index) => (
              <StaggerItem key={group.id} index={index}>
                <CompanionCard
                  kind="group"
                  item={group}
                  onPress={() => openGroupDetail(group.id)}
                />
              </StaggerItem>
            ))}
          </View>
        )}
        {section === "groups" && overview.isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
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
  const statusMuted = isService ? props.item.statusLabel !== "모집중" : closed;
  const metaLabel = isService
    ? props.item.schedule
    : categoryOf(props.item.category);

  return (
    <ListRow
      testID={testID}
      onPress={props.onPress}
      title={props.item.name}
      meta={props.item.description}
      thumbnailSeed={props.item.coverSeed}
      thumbnailIcon={isService ? "groups" : undefined}
      style={[styles.groupCard, closed ? styles.closedCard : null]}
    >
      <View style={styles.cardMetaRow}>
        <Badge tone={statusMuted ? "neutral" : "info"}>{statusLabel}</Badge>
        <Badge tone="neutral">{metaLabel}</Badge>
        <View testID={`${testID}-member-count`} style={styles.memberRow}>
          <AppIcon name="groups" size={14} color={theme.colors.textMuted} />
          <AppText variant="caption" tone="muted">
            {isService ? "참여 " : null}
            <Text style={styles.memberCount}>
              {props.item.currentMembers}
            </Text>{" "}
            /{props.item.maxMembers}명
          </AppText>
        </View>
      </View>
    </ListRow>
  );
}

/** 목록 첫 진입: 처음 8개 행이 60ms 간격으로 8px 아래에서 떠오른다. */
function StaggerItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  if (index >= STAGGER_LIMIT) return children;

  return (
    <MotionEnter mode="fadeUp" delay={motionStaggerDelay(index)}>
      {children}
    </MotionEnter>
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
  listEmpty: {
    paddingBottom: 120,
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
  // 썸네일 88 + 위아래 16 과 같은 높이. 소모임·봉사 행 높이를 맞춘다.
  groupCard: {
    minHeight: 120,
  },
  // 끝난 항목은 일부러 덜 보이게 카드 전체를 흐린다(디자인 시스템 opacity-disabled).
  closedCard: {
    opacity: theme.opacity.disabled,
  },
  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberCount: {
    color: theme.colors.primaryStrong,
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
