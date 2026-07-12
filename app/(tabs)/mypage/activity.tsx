import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  EmptyState,
  TopBar,
  UnderlineTabs,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

type ActivityTab = "posts" | "comments" | "groups";

const tabs: readonly { key: ActivityTab; label: string }[] = [
  { key: "posts", label: "나눔 게시글" },
  { key: "comments", label: "댓글" },
  { key: "groups", label: "소모임" },
];

const posts = [
  {
    thumb: 0,
    title: "유아용 카시트 나눔해요",
    status: "나눔완료",
    tone: "mute",
    date: "2026.05.12",
  },
  {
    thumb: 1,
    title: "타쇐 프라이팬 새것 같은 상태",
    status: "나눔중",
    tone: "primary",
    date: "2026.05.08",
  },
  {
    thumb: 2,
    title: "어린이 동화책 30권 묶음",
    status: "예약완료",
    tone: "warn",
    date: "2026.04.30",
  },
  {
    thumb: 3,
    title: "도자기 다세트 (몇 개 파손 있음)",
    status: "나눔완료",
    tone: "mute",
    date: "2026.04.21",
  },
  {
    thumb: 4,
    title: "아이 가을 웃 (90사이즈 남아 있어요)",
    status: "나눔중",
    tone: "primary",
    date: "2026.04.10",
  },
] as const;

const comments = [
  {
    content: "저희 목장 아이도 몇 달 전까지 이거 잘 썰어요! 공감이네요 ツ",
    src: "유아용 카시트 나눔해요",
    date: "오늘",
  },
  {
    content: "좋은 나눔 감사해요! 내일 아침 들르겠습니다",
    src: "도자기 다세트 (몇 개 파손 있음)",
    date: "어제",
  },
  {
    content: "앞으로도 잘 부탁드려요 ✍🏻",
    src: "토요 산악회 · 5/18 모임",
    date: "2일 전",
  },
  {
    content: "이 게시글 아주 유익했어요. 저도 같이 나눠볼게요",
    src: "의자 수리해 드립니다",
    date: "4일 전",
  },
  {
    content: "이번 주 수요일 일정 있으신가요?",
    src: "독서 나눔 · 5월 정기모임",
    date: "지난주",
  },
] as const;

const groups = [
  { name: "토요 산악회", members: 18, joined: "2024.11.02", seed: 0 },
  { name: "독서 나눔", members: 12, joined: "2025.02.18", seed: 1 },
  { name: "엄마들의 수다방", members: 24, joined: "2025.06.07", seed: 3 },
  { name: "찬양 프도는 이와 함께", members: 9, joined: "2025.09.14", seed: 4 },
] as const;

function variantOf(value: string | string[] | undefined) {
  const variant = Array.isArray(value) ? value[0] : value;
  if (variant === "comments" || variant === "groups" || variant === "empty") {
    return variant;
  }
  return "posts";
}

export default function ActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tab?: string;
    designVariant?: string;
  }>();
  const variant = variantOf(
    readDesignVariant(params.designVariant) ?? params.tab,
  );
  const active = variant === "empty" ? "posts" : variant;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="활동 내역" back onBack={() => router.back()} />
        <UnderlineTabs
          items={tabs}
          active={active}
          variant="border"
          onChange={(tab) => router.push(`/mypage/activity?tab=${tab}`)}
        />

        <ScrollView contentContainerStyle={styles.body}>
          {variant === "empty" ? (
            <EmptyState
              icon="schedule"
              title="활동 내역이 없습니다"
              description={
                "나눔 게시글, 댓글, 소모임 참여가\n이곳에 모여서 쉽게 살펴볼 수 있어요."
              }
            />
          ) : active === "posts" ? (
            posts.map((post, index) => (
              <PostRow
                key={post.title}
                post={post}
                last={index === posts.length - 1}
              />
            ))
          ) : active === "comments" ? (
            comments.map((comment, index) => (
              <CommentRow
                key={comment.content}
                comment={comment}
                last={index === comments.length - 1}
              />
            ))
          ) : (
            groups.map((group, index) => (
              <GroupRow
                key={group.name}
                group={group}
                last={index === groups.length - 1}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

function PostRow({
  post,
  last,
}: {
  post: (typeof posts)[number];
  last: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.rowLast : null]}>
      <VisualThumb size={56} seed={post.thumb} />
      <View style={styles.rowText}>
        <Text numberOfLines={2} style={styles.postTitle}>
          {post.title}
        </Text>
        <View style={styles.metaRow}>
          <Badge tone={post.tone}>{post.status}</Badge>
          <Text style={styles.date}>{post.date}</Text>
        </View>
      </View>
    </View>
  );
}

function CommentRow({
  comment,
  last,
}: {
  comment: (typeof comments)[number];
  last: boolean;
}) {
  return (
    <View style={[styles.commentRow, last ? styles.rowLast : null]}>
      <Text style={styles.commentText}>{comment.content}</Text>
      <View style={styles.sourceBox}>
        <MaterialIcons name="star" size={12} color={theme.colors.inkHint} />
        <Text numberOfLines={1} style={styles.sourceText}>
          {comment.src}
        </Text>
      </View>
      <Text style={styles.date}>{comment.date}</Text>
    </View>
  );
}

function GroupRow({
  group,
  last,
}: {
  group: (typeof groups)[number];
  last: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.rowLast : null]}>
      <VisualThumb size={64} seed={group.seed} style={styles.groupCover} />
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={styles.groupName}>
          {group.name}
        </Text>
        <Text style={styles.groupMeta}>
          멤버 {group.members}명 · {group.joined} 가입
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  commentRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  postTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
    fontWeight: theme.fontWeight.semibold,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  commentText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: 21,
  },
  sourceBox: {
    marginTop: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceText: {
    flex: 1,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
  },
  groupCover: {
    width: 64,
    height: 56,
    borderRadius: theme.radius.md,
  },
  groupName: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.bold,
  },
  groupMeta: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
});
