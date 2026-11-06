import { Image } from "expo-image";
// app-icon 목록에 아직 없는 아이콘이라 lucide 에서 바로 쓴다(선 굵기는 AppIcon 기본 1.5).
import { Gift, MessageCircle } from "lucide-react-native";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { MotionEnter, MotionPressable, motionStaggerDelay } from "./motion";

/** 나눔 상태. 나눔중(open)은 표시 없음. */
export type ShareCardState = "open" | "reserved" | "done";

const PHOTO_RADIUS = 10;
/** 흰 배경 사진도 보이게 하는 안쪽 1px 선. 디자인 시스템에 토큰이 없는 반투명 값. */
const PHOTO_INNER_LINE = "rgba(25,31,40,0.06)";
/** 사진 위 1/N 알약 바탕. 디자인 시스템에 토큰이 없는 반투명 값. */
const COUNT_PILL_BG = "rgba(25,31,40,0.6)";
/** 목록 위쪽 처음 8개만 순서대로 떠오른다. */
const STAGGER_LIMIT = 8;

const thumbColors = [
  theme.colors.thumb1,
  theme.colors.thumb2,
  theme.colors.thumb3,
  theme.colors.thumb4,
  theme.colors.thumb5,
  theme.colors.thumb6,
];

/** ShareCard 를 쌓는 흰 판. 행 사이에만 1px surfaceSubtle 선을 넣는다. */
export function ShareList({
  children,
  style,
  testID,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View style={[styles.list, style]} testID={testID}>
      {rows.map((row, index) => (
        <Fragment key={row.key ?? index}>
          {index > 0 ? (
            <View
              style={styles.divider}
              testID={testID ? `${testID}-divider` : undefined}
            />
          ) : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export function ShareCard({
  title,
  state = "open",
  category,
  meta,
  comments,
  photo,
  photoCount,
  thumbSeed = 0,
  enterIndex,
  onPress,
  style,
  testID,
}: {
  title: string;
  state?: ShareCardState;
  /** 맨 위 카테고리 이름(예: 가구). */
  category?: string;
  /** "[작성자] · [등록 시각]" 한 줄. */
  meta?: string;
  /** 오른쪽 댓글 수. 주지 않으면 숨긴다. */
  comments?: number;
  /** 대표 사진 주소. 없으면 thumb 색 + 선물 아이콘. */
  photo?: string | null;
  /** 사진 수. 2장 이상이면 1/N 을 보인다. */
  photoCount?: number;
  /** 사진이 없을 때 thumb1~6 중 고르는 값. */
  thumbSeed?: number;
  /** 목록 안 순서. 처음 8개는 60ms 간격으로 떠오른다. 주지 않으면 움직임 없음. */
  enterIndex?: number;
  onPress?: () => void;
  /** 끝난 항목 흐림(opacity-soft) 같은 모양은 부르는 쪽이 정한다. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const done = state === "done";
  const reserved = state === "reserved";
  const thumbColor = thumbColors[Math.abs(thumbSeed) % thumbColors.length];

  const card = (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, style]}
      testID={testID}
    >
      <View
        style={[styles.photo, { backgroundColor: thumbColor }]}
        testID={testID ? `${testID}-photo` : undefined}
      >
        {photo ? (
          <Image
            contentFit="cover"
            source={{ uri: photo }}
            style={StyleSheet.absoluteFill}
            transition={150}
          />
        ) : (
          <Gift
            size={24}
            color={theme.colors.textMuted}
            strokeWidth={1.5}
            testID={testID ? `${testID}-placeholder` : undefined}
          />
        )}
        <View pointerEvents="none" style={styles.photoLine} />
        {done ? (
          <View
            style={styles.doneOverlay}
            testID={testID ? `${testID}-done` : undefined}
          >
            <AppText variant="caption" weight="bold" tone="inverse">
              나눔완료
            </AppText>
          </View>
        ) : null}
        {reserved ? (
          <View
            style={styles.reservedLabel}
            testID={testID ? `${testID}-reserved` : undefined}
          >
            <AppText
              variant="caption"
              weight="bold"
              tone="inverse"
              style={styles.smallText}
            >
              예약중
            </AppText>
          </View>
        ) : null}
        {photoCount && photoCount >= 2 ? (
          <View style={styles.countPill}>
            <AppText
              variant="caption"
              weight="semibold"
              tone="inverse"
              style={styles.smallText}
            >
              1/{photoCount}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {category ? (
          <AppText variant="caption" weight="semibold" tone="brand">
            {category}
          </AppText>
        ) : null}
        <AppText
          numberOfLines={2}
          variant="body"
          weight="semibold"
          tone={done ? "muted" : "primary"}
        >
          {title}
        </AppText>
        {meta || comments != null ? (
          <View style={styles.metaRow}>
            <AppText
              numberOfLines={1}
              variant="caption"
              weight="regular"
              tone="muted"
              style={styles.metaText}
            >
              {meta}
            </AppText>
            {comments != null ? (
              <View
                accessibilityLabel={`댓글 ${comments}개`}
                style={styles.comments}
                testID={testID ? `${testID}-comments` : undefined}
              >
                <MessageCircle
                  size={14}
                  color={theme.colors.textMuted}
                  strokeWidth={1.5}
                />
                <AppText variant="caption" weight="regular" tone="muted">
                  {comments}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </MotionPressable>
  );

  if (enterIndex === undefined || enterIndex >= STAGGER_LIMIT) return card;

  return (
    <MotionEnter mode="fadeUp" delay={motionStaggerDelay(enterIndex)}>
      {card}
    </MotionEnter>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.surface,
  },
  photo: {
    width: theme.layout.listThumb,
    height: theme.layout.listThumb,
    borderRadius: PHOTO_RADIUS,
    overflow: "hidden",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  photoLine: {
    ...StyleSheet.absoluteFill,
    borderRadius: PHOTO_RADIUS,
    borderWidth: 1,
    borderColor: PHOTO_INNER_LINE,
  },
  // ShareCard 규격의 나눔완료 덮개(50% 어두움)는 sheetOverlay 와 같은 값이다.
  doneOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.sheetOverlay,
    alignItems: "center",
    justifyContent: "center",
  },
  reservedLabel: {
    position: "absolute",
    left: 5,
    top: 5,
    borderRadius: 6,
    backgroundColor: theme.colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countPill: {
    position: "absolute",
    right: 5,
    bottom: 5,
    borderRadius: theme.radius.full,
    backgroundColor: COUNT_PILL_BG,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  // 사진 위 작은 라벨은 ShareCard 규격대로 11/16.
  smallText: {
    fontSize: 11,
    lineHeight: 16,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metaRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    minWidth: 0,
  },
  metaText: {
    flexShrink: 1,
    minWidth: 0,
  },
  comments: {
    marginLeft: "auto",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
});
