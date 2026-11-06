import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { MARKET_CATEGORIES } from "../../../src/constants/domainOptions";
import {
  useMarketOverview,
  useMyMarketOverview,
} from "../../../src/hooks/useMarket";
import type {
  MarketCategory,
  MarketOverviewItem,
} from "../../../src/types/market";
import { useMotionRouteParam } from "../../../src/hooks/useMotionRouteParam";
import { readDesignVariant } from "../../../src/lib/designVariant";
import { useScaleHeightForFont } from "../../../src/lib/fontScale";

type MarketSegment = "all" | "sharing" | "mine";

const statusTabs: readonly { key: MarketSegment; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "sharing", label: "나눔중" },
  { key: "mine", label: "내 나눔" },
];

const MARKET_STICKY_CONTROLS_HEIGHT = 116;

export default function MarketScreen() {
  // 글자 크기 설정이 크면 상단 고정 영역 높이도 함께 키운다 (Issue 258)
  const scaleForFont = useScaleHeightForFont();
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    designVariant?: string;
    status?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useMarketOverview();
  const isEmpty = variant === "empty";
  const routeStatus =
    params.status === "all" ||
    params.status === "sharing" ||
    params.status === "mine"
      ? params.status
      : variant === "tab-all"
        ? "all"
        : "sharing";
  const routeCategory =
    MARKET_CATEGORIES.find((item) => item.key === params.category)?.key ??
    "all";
  const [activeStatus, setActiveStatus] = useMotionRouteParam<MarketSegment>(
    routeStatus,
    (status) => {
      router.setParams({ status: status === "sharing" ? undefined : status });
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
  const mine = useMyMarketOverview(
    category === "all"
      ? undefined
      : (category as Exclude<MarketCategory, "all">),
    activeStatus === "mine",
  );
  const list = activeStatus === "mine" ? mine : overview;
  const isError = variant === "network-error" || list.isError;
  const sourceItems = list.data?.items ?? [];
  const statusPosts =
    isError || isEmpty
      ? []
      : activeStatus === "sharing"
        ? sourceItems.filter(
            (post) => post.status === "sharing" || post.status === "reserved",
          )
        : sourceItems;
  const visiblePosts =
    activeStatus === "mine"
      ? statusPosts
      : statusPosts.filter(
          (post) => category === "all" || post.category === category,
        );
  const isLoading = list.isPending && !isError && !isEmpty;

  return (
    <StickyHeaderScreen
      testID="screen-market"
      title="나눔"
      subtitle="이웃과 물건을 나누며 따뜻함을 전해요"
      refreshing={list.isRefetching}
      onRefresh={() => void list.refetch()}
      onEndReached={() => {
        if (list.hasNextPage && !list.isFetchingNextPage) {
          void list.fetchNextPage();
        }
      }}
      stickyControls={
        <View testID="market-sticky-controls-content">
          <SegmentedTabs
            items={statusTabs}
            active={activeStatus}
            onChange={setActiveStatus}
            style={[styles.statusTabs, { height: scaleForFont(40) }]}
            testIDPrefix="market-status"
          />

          <FilterChips
            items={MARKET_CATEGORIES}
            active={category}
            onChange={setCategory}
            style={[styles.categoryScroll, { height: scaleForFont(44) }]}
            testIDPrefix="market-category"
          />
        </View>
      }
      stickyControlsHeight={scaleForFont(MARKET_STICKY_CONTROLS_HEIGHT)}
      // 동행과 동일: 내릴 때 숨김 · 위로 살짝 올리면 세그먼트·필터 다시 표시.
      stickyControlsHideMode="direction"
      overlay={
        <FloatingActionButton
          label="나눔하기"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/market-new")}
        />
      }
    >
      <View
        style={[
          styles.list,
          !isLoading && (isError || visiblePosts.length === 0)
            ? styles.listEmpty
            : null,
        ]}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={4} />
          </View>
        ) : isError ? (
          <ErrorState
            message="네트워크 연결을 확인하고 다시 시도해주세요."
            onRetry={() => list.refetch()}
          />
        ) : visiblePosts.length === 0 ? (
          <MarketEmptyState
            status={isEmpty ? null : activeStatus}
            isSearching={false}
          />
        ) : (
          <MotionEnter>
            {visiblePosts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onPress={() => router.push(`/market/${post.id}`)}
              />
            ))}
          </MotionEnter>
        )}
        {list.isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
      </View>
    </StickyHeaderScreen>
  );
}

function PostRow({
  post,
  onPress,
}: {
  post: MarketOverviewItem;
  onPress: () => void;
}) {
  const done = post.status === "done";
  const reserved = post.status === "reserved";

  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      pressedScale={0.985}
      style={styles.row}
    >
      <View style={styles.thumbWrap}>
        {post.thumbnailUrl ? (
          <Image
            contentFit="cover"
            source={{ uri: post.thumbnailUrl }}
            style={styles.thumbImage}
            transition={150}
          />
        ) : (
          <VisualThumb size={theme.layout.listThumb} seed={post.thumbSeed} />
        )}
        {done ? (
          <View style={styles.doneOverlay}>
            <AppText variant="caption" tone="inverse">
              나눔완료
            </AppText>
          </View>
        ) : null}
        {reserved ? <StatusBadge /> : null}
      </View>

      <View style={[styles.rowText, done ? styles.rowTextDone : null]}>
        <AppText
          numberOfLines={2}
          variant="body"
          weight="semibold"
          tone={done ? "muted" : "primary"}
        >
          {post.title}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.postMeta}>
          {categoryOf(post.category)} · {post.authorName} · {post.createdLabel}
        </AppText>
      </View>
    </MotionPressable>
  );
}

function categoryOf(key: string) {
  return (
    MARKET_CATEGORIES.find((category) => category.key === key)?.label ?? "기타"
  );
}

function StatusBadge() {
  return (
    <View style={styles.statusBadge}>
      <AppText
        variant="caption"
        weight="semibold"
        style={styles.statusBadgeText}
      >
        예약중
      </AppText>
    </View>
  );
}

function MarketEmptyState({
  status,
  isSearching,
}: {
  status: MarketSegment | null;
  isSearching?: boolean;
}) {
  const message = isSearching
    ? {
        title: "검색 결과가 없어요",
        description: "다른 검색어나 카테고리로 다시 찾아보세요.",
      }
    : status === "mine"
      ? {
          title: "아직 등록한 나눔이 없어요",
          description:
            "내가 올린 물건과 진행 상태를\n이곳에서 확인할 수 있어요.",
        }
      : status === "sharing"
        ? {
            title: "진행 중인 나눔이 없어요",
            description:
              "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
          }
        : {
            title: "아직 나눔 게시글이 없어요",
            description:
              "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
          };

  return (
    <Empty
      icon={isSearching ? "search" : "shopping-bag"}
      title={message.title}
      description={message.description}
    />
  );
}

const styles = StyleSheet.create({
  statusTabs: {
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
  loading: {
    paddingTop: theme.spacing[2],
  },
  row: {
    flexDirection: "row",
    gap: theme.layout.listGap,
    marginHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  thumbWrap: {
    width: theme.layout.listThumb,
    height: theme.layout.listThumb,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    flexShrink: 0,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  doneOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(25,31,40,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    left: 6,
    top: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.warningSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    color: theme.colors.warningText,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: theme.spacing[2],
    paddingVertical: 2,
  },
  // 나눔완료는 일부러 덜 보이게 흐린다(디자인 시스템 opacity-soft).
  rowTextDone: {
    opacity: theme.opacity.soft,
  },
  postMeta: {
    marginTop: 0,
  },
  emptyWrap: {
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 60,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: theme.layout.screenX,
    bottom: 86,
  },
});
