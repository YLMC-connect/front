// app-icon 목록에 아직 없는 아이콘이라 lucide 에서 바로 쓴다(선 굵기는 AppIcon 기본 1.5).
import { Ellipsis } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { Avatar } from "./display";

/** 12px 글자 버튼(답글 달기·삭제)도 누르는 곳을 44 높이로 맞춘다. */
const TEXT_BUTTON_HIT = { top: 13, bottom: 13, left: 6, right: 6 };
/** 24 아이콘 버튼의 누르는 곳을 44로 맞춘다. */
const ICON_BUTTON_HIT = 10;

/**
 * 나눔 상세 댓글 한 개. 말풍선 없이 글만 둔다.
 * 답글·좋아요·더보기처럼 서버가 아직 주지 않는 기능은 콜백이 없으면 숨긴다.
 */
export function CommentBubble({
  name,
  time,
  children,
  author = false,
  mine = false,
  reply = false,
  liked = false,
  avatarSeed,
  onReply,
  onDelete,
  onLike,
  onMore,
  style,
  testID,
}: {
  name: string;
  /** 표시용 시각(예: "3분 전"). */
  time: string;
  /** 본문. 문자열이면 14/20 본문 글자로 그린다. */
  children: ReactNode;
  /** 글 쓴 사람의 댓글이면 이름 옆 "작성자" 배지. */
  author?: boolean;
  /** 내 댓글이면 "삭제" 를 보인다(색 구분은 하지 않는다). */
  mine?: boolean;
  /** 답글이면 48 들여쓰기 + 아바타 28. 한 단계까지만. */
  reply?: boolean;
  liked?: boolean;
  avatarSeed?: string | number;
  onReply?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  /** 수정·신고 메뉴(⋯). */
  onMore?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const showDelete = mine && onDelete;
  const showActions = Boolean(onReply || showDelete);

  return (
    <View
      style={[styles.row, reply ? styles.reply : null, style]}
      testID={testID}
    >
      <Avatar name={name} size={reply ? 28 : 36} seed={avatarSeed} />
      <View style={styles.body}>
        <View style={styles.head}>
          <AppText
            numberOfLines={1}
            variant="label"
            weight="semibold"
            style={styles.name}
          >
            {name}
          </AppText>
          {author ? (
            <View
              style={styles.authorBadge}
              testID={testID ? `${testID}-author` : undefined}
            >
              <AppText variant="caption" weight="semibold" tone="brand">
                작성자
              </AppText>
            </View>
          ) : null}
          <AppText variant="caption" weight="regular" tone="muted">
            {time}
          </AppText>
        </View>
        {typeof children === "string" ? (
          <AppText variant="label" weight="regular">
            {children}
          </AppText>
        ) : (
          children
        )}
        {showActions ? (
          <View style={styles.actions}>
            {onReply ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={TEXT_BUTTON_HIT}
                onPress={onReply}
              >
                <AppText variant="caption" weight="semibold" tone="muted">
                  답글 달기
                </AppText>
              </Pressable>
            ) : null}
            {showDelete ? (
              <Pressable
                accessibilityLabel="댓글 삭제"
                accessibilityRole="button"
                hitSlop={TEXT_BUTTON_HIT}
                onPress={onDelete}
              >
                <AppText variant="caption" weight="semibold" tone="muted">
                  삭제
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      {onMore ? (
        <Pressable
          accessibilityLabel="댓글 메뉴"
          accessibilityRole="button"
          hitSlop={ICON_BUTTON_HIT}
          onPress={onMore}
          style={styles.iconButton}
        >
          <Ellipsis
            size={18}
            color={theme.colors.textMuted}
            strokeWidth={1.5}
          />
        </Pressable>
      ) : null}
      {onLike ? (
        <Pressable
          accessibilityLabel={liked ? "좋아요 취소" : "좋아요"}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          hitSlop={ICON_BUTTON_HIT}
          onPress={onLike}
          style={styles.iconButton}
          testID={testID ? `${testID}-like` : undefined}
        >
          <AppIcon
            name="favorite"
            size={18}
            color={liked ? theme.colors.dangerIcon : theme.colors.neutral400}
            fill={liked ? theme.colors.dangerIcon : "none"}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  reply: {
    paddingLeft: theme.spacing[12],
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  name: {
    flexShrink: 1,
  },
  authorBadge: {
    borderRadius: 6,
    backgroundColor: theme.colors.primarySubtle,
    paddingHorizontal: 6,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginTop: 6,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
