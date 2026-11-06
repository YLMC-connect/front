import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { StaggerItem } from "../../src/components/mypage/StaggerItem";
import { Badge, Empty, TopBar, UnderlineTabs } from "../../src/components/ui";
import { ListRow } from "../../src/components/ui/list-row";
import { theme } from "../../src/constants/theme";
import { readDesignVariant } from "../../src/lib/designVariant";
import type {
  MyPageActivityComment,
  MyPageActivityGroup,
  MyPageActivityPost,
} from "../../src/types/mypage";
import {
  fetchMyPageActivityComments,
  fetchMyPageActivityGroups,
  fetchMyPageActivityPosts,
} from "../../src/services/mypageService";

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
  const initialVariant = variantOf(
    readDesignVariant(params.designVariant) ?? params.tab,
  );
  const isDesignEmpty = initialVariant === "empty";
  const [activeTab, setActiveTab] = useState<ActivityTab>(
    isDesignEmpty ? "posts" : initialVariant,
  );
  const [posts, setPosts] = useState<readonly MyPageActivityPost[]>([]);
  const [comments, setComments] = useState<readonly MyPageActivityComment[]>(
    [],
  );
  const [groups, setGroups] = useState<readonly MyPageActivityGroup[]>([]);

  useEffect(() => {
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
  }, []);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="활동 내역" back onBack={() => router.back()} />
        <UnderlineTabs
          items={tabs}
          active={activeTab}
          variant="border"
          onChange={(tab) => setActiveTab(tab as ActivityTab)}
        />

        <ScrollView contentContainerStyle={styles.body}>
          {isDesignEmpty ? (
            <Empty
              icon="schedule"
              title="활동 내역이 없어요"
              description={
                "나눔 게시글, 댓글, 소모임 참여가\n이곳에 모여서 쉽게 살펴볼 수 있어요."
              }
            />
          ) : activeTab === "posts" ? (
            posts.length === 0 ? (
              <Empty
                icon="inbox"
                title="작성한 게시글이 없어요"
                description="나눔 탭에서 물품을 등록해보세요."
              />
            ) : (
              posts.map((post, index) => (
                <StaggerItem key={post.id} index={index}>
                  <PostRow post={post} last={index === posts.length - 1} />
                </StaggerItem>
              ))
            )
          ) : activeTab === "comments" ? (
            comments.length === 0 ? (
              <Empty
                icon="description"
                title="작성한 댓글이 없어요"
                description="게시글에 따뜻한 댓글을 남겨보세요."
              />
            ) : (
              comments.map((comment, index) => (
                <StaggerItem key={comment.id} index={index}>
                  <CommentRow
                    comment={comment}
                    last={index === comments.length - 1}
                  />
                </StaggerItem>
              ))
            )
          ) : groups.length === 0 ? (
            <Empty
              icon="groups"
              title="참여한 소모임이 없어요"
              description="관심 있는 소모임에 참여해보세요."
            />
          ) : (
            groups.map((group, index) => (
              <StaggerItem key={group.id} index={index}>
                <GroupRow group={group} last={index === groups.length - 1} />
              </StaggerItem>
            ))
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

function PostRow({ post, last }: { post: MyPageActivityPost; last: boolean }) {
  return (
    <ListRow
      title={post.title}
      meta={post.date}
      thumbnailSeed={post.thumb}
      divider={!last}
    >
      <Badge tone={post.tone}>{post.status}</Badge>
    </ListRow>
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
        <AppIcon name="star" size={12} color={theme.colors.textMuted} />
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
    <ListRow
      title={group.name}
      meta={`멤버 ${group.members}명 · ${group.joined} 가입`}
      thumbnailSeed={group.seed}
      divider={!last}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sourceCaption: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  body: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 16,
  },
  commentRow: {
    paddingHorizontal: theme.layout.screenX,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  date: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  commentText: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  sourceBox: {
    marginTop: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  emptyWrap: {
    paddingHorizontal: 14,
    paddingTop: 72,
    paddingBottom: 80,
  },
});
