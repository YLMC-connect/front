import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { StickyHeaderScreen } from "../../../src/components/layout/StickyHeaderScreen";
import {
  EmptyState,
  ErrorState,
  AppText,
  FilterChips,
  FloatingActionButton,
  ListSkeleton,
  SegmentedTabs,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { MARKET_CATEGORIES } from "../../../src/constants/domainOptions";
import { useMarketOverview } from "../../../src/hooks/useMarket";
import { useMotionRouteParam } from "../../../src/hooks/useMotionRouteParam";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { MarketOverviewItem } from "../../../src/types/market";

type Status = "all" | "sharing" | "reserved" | "done";

const statusTabs: readonly { key: Status; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "sharing", label: "나눔중" },
  { key: "reserved", label: "예약중" },
  { key: "done", label: "나눔완료" },
];

const MARKET_STICKY_CONTROLS_HEIGHT = 116;

export default function MarketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    designVariant?: string;
    status?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useMarketOverview();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isError = variant === "network-error" || overview.isError;
  const isEmpty = variant === "empty";
  const routeStatus =
    params.status === "all" ||
    params.status === "sharing" ||
    params.status === "reserved" ||
    params.status === "done"
      ? params.status
      : variant === "tab-all"
        ? "all"
        : variant === "tab-reserved"
          ? "reserved"
          : variant === "tab-done"
            ? "done"
            : "sharing";
  const routeCategory =
    MARKET_CATEGORIES.find((item) => item.key === params.category)?.key ??
    "all";
  const [activeStatus, setActiveStatus] = useMotionRouteParam<Status>(
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
  const statusPosts =
    isError || isEmpty
      ? []
      : activeStatus === "all"
        ? (overview.data?.items ?? [])
        : (overview.data?.items ?? []).filter(
            (post) => post.status === activeStatus,
          );
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visiblePosts = statusPosts.filter(
    (post) =>
      (category === "all" || post.category === category) &&
      (!normalizedSearch ||
        post.title.toLocaleLowerCase().includes(normalizedSearch) ||
        post.authorName.toLocaleLowerCase().includes(normalizedSearch)),
  );
  const isLoading = overview.isPending && !isError && !isEmpty;

  return (
    <StickyHeaderScreen
      testID="screen-market"
      title="나눔"
      subtitle="이웃과 물건을 나누며 따뜻함을 전해요"
      stickyControls={
        <View testID="market-sticky-controls-content">
          <SegmentedTabs
            items={statusTabs}
            active={activeStatus}
            onChange={setActiveStatus}
            style={styles.statusTabs}
            testIDPrefix="market-status"
          />

          <FilterChips
            items={MARKET_CATEGORIES}
            active={category}
            onChange={setCategory}
            style={styles.categoryScroll}
            testIDPrefix="market-category"
          />
        </View>
      }
      stickyControlsHeight={MARKET_STICKY_CONTROLS_HEIGHT}
      right={
        <Pressable
          accessibilityLabel={searchOpen ? "나눔 검색 닫기" : "나눔 검색"}
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
          label="글쓰기"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/market-new")}
        />
      }
    >
      {searchOpen ? (
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={19} color={theme.colors.inkMute} />
          <TextInput
            autoFocus
            accessibilityLabel="나눔 검색어"
            value={search}
            onChangeText={setSearch}
            placeholder="제목 또는 작성자 검색"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.searchInput}
          />
        </View>
      ) : null}

      <View style={styles.list}>
        {isLoading ? (
          <View style={styles.loading}>
            <ListSkeleton rows={4} />
          </View>
        ) : isError ? (
          <ErrorState
            message="네트워크 연결을 확인하고 다시 시도해주세요."
            onRetry={() => overview.refetch()}
          />
        ) : visiblePosts.length === 0 ? (
          <MarketEmptyState
            status={isEmpty ? null : activeStatus}
            onCreate={() => router.push("/modal/market-new")}
          />
        ) : (
          visiblePosts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onPress={() => router.push(`/market/${post.id}`)}
            />
          ))
        )}
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
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.thumbWrap}>
        <VisualThumb size={96} seed={post.thumbSeed} />
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
          variant="cardTitle"
          tone={done ? "muted" : "primary"}
        >
          {post.title}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.postMeta}>
          {post.authorName} · {post.createdLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

function StatusBadge() {
  return (
    <View style={styles.statusBadge}>
      <AppText variant="caption" tone="inverse">
        예약중
      </AppText>
    </View>
  );
}

function MarketEmptyState({
  status,
  onCreate,
}: {
  status: Status | null;
  onCreate: () => void;
}) {
  const message =
    status === "reserved"
      ? {
          title: "예약중인 나눔이 없어요",
          description: "관심 있는 나눔이 있다면\n댓글로 먼저 연락해보세요.",
        }
      : status === "done"
        ? {
            title: "아직 완료된 나눔이 없어요",
            description: "완료된 나눔은 이곳에서\n다시 확인할 수 있어요.",
          }
        : status === "sharing"
          ? {
              title: "진행 중인 나눔이 없어요",
              description:
                "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
            }
          : {
              title: "아직 나눔 게시글이 없습니다",
              description:
                "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
            };

  return (
    <View style={styles.emptyWrap}>
      <EmptyState
        title={message.title}
        description={message.description}
        icon="shopping-bag"
        actionLabel="나눔 등록하기"
        onAction={onCreate}
      />
    </View>
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
  statusTabs: {
    flexShrink: 0,
    height: 44,
    marginHorizontal: theme.layout.screenX,
    marginTop: 4,
    marginBottom: theme.layout.listGap,
  },
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 44,
    marginBottom: theme.layout.listGap,
  },
  list: {
    gap: theme.spacing[3],
    paddingBottom: 164,
  },
  loading: {
    paddingTop: theme.spacing[2],
  },
  row: {
    flexDirection: "row",
    gap: theme.layout.listGap,
    marginHorizontal: theme.layout.screenX,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  thumbWrap: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    flexShrink: 0,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,30,18,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    left: 6,
    top: 6,
    borderRadius: 6,
    backgroundColor: "#E89A3C",
    paddingHorizontal: 9,
    paddingVertical: 4,
    ...theme.shadow.card,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  rowTextDone: {
    opacity: 0.55,
  },
  postMeta: {
    marginTop: 6,
  },
  emptyWrap: {
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 60,
  },
  fab: {
    position: "absolute",
    right: theme.layout.screenX,
    bottom: 86,
  },
});
