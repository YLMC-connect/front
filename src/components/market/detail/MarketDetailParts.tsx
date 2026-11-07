import { AppIcon } from "@/components/ui/app-icon";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { AppText, DetailMiniAction } from "../../ui";
import { CommentBubble } from "../../ui/comment-bubble";
import { theme } from "../../../constants/theme";
import type { MarketDetailComment } from "../../../types/market";
import { styles } from "./marketDetailStyles";

export function CarouselSlide({
  children,
  index,
  scrollX,
  width,
}: {
  children: React.ReactNode;
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const safeWidth = Math.max(width, 1);
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * safeWidth, index * safeWidth, (index + 1) * safeWidth],
      [0.94, 1, 0.94],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * safeWidth, index * safeWidth, (index + 1) * safeWidth],
      [0.78, 1, 0.78],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[{ width, height: width, overflow: "hidden" }, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

export function CarouselDot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const safeWidth = Math.max(width, 1);
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * safeWidth, index * safeWidth, (index + 1) * safeWidth],
      [6, 18, 6],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * safeWidth, index * safeWidth, (index + 1) * safeWidth],
      [0.55, 1, 0.55],
      Extrapolation.CLAMP,
    );
    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dotOn, animatedStyle]} />;
}

export function CenterBadge({ label }: { label: string }) {
  return (
    <View pointerEvents="none" style={styles.centerBadge}>
      <Text style={styles.centerBadgeText}>{label}</Text>
    </View>
  );
}

export function StatusBanner({
  icon,
  title,
  text,
  warn = false,
}: {
  icon: "check" | "schedule";
  title: string;
  text: string;
  warn?: boolean;
}) {
  return (
    <View style={[styles.banner, warn ? styles.bannerWarn : null]}>
      <View style={[styles.bannerIcon, warn ? styles.bannerIconWarn : null]}>
        <AppIcon name={icon} size={16} color={theme.colors.onPrimary} />
      </View>
      <View style={styles.bannerTextWrap}>
        <Text
          style={[styles.bannerTitle, warn ? styles.bannerTitleWarn : null]}
        >
          {title}
        </Text>
        <Text style={[styles.bannerText, warn ? styles.bannerTextWarn : null]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

export function CommentsSection({
  comments,
  onEdit,
  onDelete,
}: {
  comments: MarketDetailComment[];
  onEdit: (comment: MarketDetailComment) => void;
  onDelete: (comment: MarketDetailComment) => void;
}) {
  const activeCount = comments.filter((comment) => !comment.isDeleted).length;

  return (
    <View style={styles.comments}>
      <Text style={styles.commentCount}>댓글 {activeCount}개</Text>
      {/* 서버에 답글·좋아요가 없어 CommentBubble 의 답글 달기·하트는 넘기지 않는다(숨김). */}
      {comments.map((comment) => (
        <CommentBubble
          key={comment.id}
          name={comment.authorName}
          time={
            comment.isEdited
              ? `${comment.createdLabel} · 수정됨`
              : comment.createdLabel
          }
          testID={`market-comment-${comment.id}`}
        >
          {comment.isDeleted ? (
            <Text style={styles.deletedComment}>삭제된 댓글입니다</Text>
          ) : (
            <>
              <AppText variant="label" weight="regular">
                {comment.content}
              </AppText>
              {comment.isMine ? (
                <View style={styles.commentActions}>
                  <DetailMiniAction
                    testID={`market-comment-edit-${comment.id}`}
                    accessibilityLabel={`댓글 수정 ${comment.content}`}
                    icon="edit"
                    label="수정"
                    onPress={() => onEdit(comment)}
                  />
                  <DetailMiniAction
                    testID={`market-comment-delete-${comment.id}`}
                    accessibilityLabel={`댓글 삭제 ${comment.content}`}
                    icon="delete-outline"
                    label="삭제"
                    danger
                    onPress={() => onDelete(comment)}
                  />
                </View>
              ) : null}
            </>
          )}
        </CommentBubble>
      ))}
    </View>
  );
}
