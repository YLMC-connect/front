import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import type {
  MyPageActivityComment,
  MyPageActivityGroup,
  MyPageActivityPost,
} from "../../../src/types/mypage";
import {
  fetchMyPageActivityComments,
  fetchMyPageActivityGroups,
  fetchMyPageActivityPosts,
  readLocalMyPageActivity,
  resolveMyPageAdapterMode,
} from "../../../src/services/mypageService";

type ActivityTab = "posts" | "comments" | "groups";

const tabs: readonly { key: ActivityTab; label: string }[] = [
  { key: "posts", label: "나눔 게시글" },
  { key: "comments", label: "댓글" },
  { key: "groups", label: "소모임" },
];

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
  const localActivity = readLocalMyPageActivity();
  const httpAdapter = resolveMyPageAdapterMode() === "http";
  const [posts, setPosts] = useState<readonly MyPageActivityPost[]>(
    httpAdapter ? [] : localActivity.posts,
  );
  const [comments, setComments] = useState<readonly MyPageActivityComment[]>(
    httpAdapter ? [] : localActivity.comments,
  );
  const [groups, setGroups] = useState<readonly MyPageActivityGroup[]>(
    httpAdapter ? [] : localActivity.groups,
  );

  useEffect(() => {
    if (!httpAdapter) return undefined;
    let cancelled = false;
    void Promise.all([
      fetchMyPageActivityPosts(),
      fetchMyPageActivityComments(),
      fetchMyPageActivityGroups(),
    ])
      .then(([nextPosts, nextComments, nextGroups]) => {
        if (cancelled) return;
        setPosts(nextPosts.items);
        setComments(nextComments.items);
        setGroups(nextGroups.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [httpAdapter]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="활동 내역" back onBack={() => router.back()} />
        {__DEV__ && !httpAdapter ? (
          <Text style={styles.sourceCaption}>목업 데이터</Text>
        ) : null}
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
                key={post.id}
                post={post}
                last={index === posts.length - 1}
              />
            ))
          ) : active === "comments" ? (
            comments.map((comment, index) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                last={index === comments.length - 1}
              />
            ))
          ) : (
            groups.map((group, index) => (
              <GroupRow
                key={group.id}
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

function PostRow({ post, last }: { post: MyPageActivityPost; last: boolean }) {
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
  comment: MyPageActivityComment;
  last: boolean;
}) {
  return (
    <View style={[styles.commentRow, last ? styles.rowLast : null]}>
      <Text style={styles.commentText}>{comment.content}</Text>
      <View style={styles.sourceBox}>
        <AppIcon name="star" size={12} color={theme.colors.inkHint} />
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
  group: MyPageActivityGroup;
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
  sourceCaption: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
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
