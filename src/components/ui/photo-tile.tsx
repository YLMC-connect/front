import { Image } from "expo-image";
// app-icon 목록에 아직 없는 아이콘이라 lucide 에서 바로 쓴다(선 굵기는 AppIcon 기본 1.5).
import { Camera } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { LinearTransition, ZoomOut } from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { AnimatedProgressFill } from "./motion";

export const PHOTO_TILE_SIZE = 80;
/** 지우기 원·대표 띠·업로드 덮개 바탕. 디자인 시스템에 토큰이 없는 반투명 값. */
const DARK_SCRIM = "rgba(25,31,40,0.6)";

type PhotoTileBase = {
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type PhotoTileProps =
  | (PhotoTileBase & {
      variant: "add";
      onPress?: () => void;
      disabled?: boolean;
    })
  | (PhotoTileBase & {
      /** photo: 올린 사진, uploading: 올리는 중, failed: 올리기 실패. */
      variant: "photo" | "uploading" | "failed";
      uri: string;
      /** 0부터 센 순서. 접근성 이름("사진 1 삭제")에 쓴다. */
      index: number;
      /** 대표 사진이면 아래에 "대표" 띠. 보통 첫 장. */
      cover?: boolean;
      /** uploading 진행률(0~100). */
      progress?: number;
      onRemove?: () => void;
      onRetry?: () => void;
    });

/**
 * 등록 화면 사진 한 줄의 타일(80, radius-sm). 줄 간격 8·최대 장수·순서 바꾸기는 부르는 쪽이 정한다.
 * 지우면 작아지며 사라지고 뒤 타일이 당겨진다(200ms, 동작 줄이기면 바로).
 */
export function PhotoTile(props: PhotoTileProps) {
  if (props.variant === "add") {
    return (
      <Pressable
        accessibilityLabel="사진 추가"
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(props.disabled) }}
        disabled={props.disabled}
        onPress={props.onPress}
        style={[styles.tile, styles.add, props.style]}
        testID={props.testID}
      >
        <Camera
          size={20}
          color={theme.colors.primaryStrong}
          strokeWidth={1.5}
        />
        <AppText variant="caption" weight="bold" tone="brand">
          추가
        </AppText>
      </Pressable>
    );
  }

  const { variant, uri, index, cover, progress = 0, onRemove, onRetry } = props;
  const number = index + 1;
  const testID = props.testID;

  return (
    <Animated.View
      exiting={ZoomOut.duration(theme.motion.duration.base)}
      layout={LinearTransition.duration(theme.motion.duration.base)}
      style={[styles.tile, styles.photo, props.style]}
      testID={testID}
    >
      <Image
        contentFit="cover"
        source={{ uri }}
        style={StyleSheet.absoluteFill}
      />
      {cover && variant === "photo" ? (
        <View
          style={styles.coverBand}
          testID={testID ? `${testID}-cover` : undefined}
        >
          <AppText
            variant="caption"
            weight="bold"
            tone="inverse"
            style={styles.smallText}
          >
            대표
          </AppText>
        </View>
      ) : null}
      {variant === "uploading" ? (
        <View
          accessible
          accessibilityLabel={`사진 ${number} 올리는 중`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
          style={styles.uploading}
          testID={testID ? `${testID}-uploading` : undefined}
        >
          <AppText variant="caption" weight="bold" tone="inverse">
            {Math.round(progress)}%
          </AppText>
          <View style={styles.track}>
            <View style={styles.trackBg} />
            <AnimatedProgressFill percent={progress} style={styles.fill} />
          </View>
        </View>
      ) : null}
      {variant === "failed" ? (
        <Pressable
          accessibilityLabel={`사진 ${number} 다시 시도`}
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.failed}
          testID={testID ? `${testID}-retry` : undefined}
        >
          <AppText variant="caption" weight="bold" tone="inverse">
            다시 시도
          </AppText>
        </Pressable>
      ) : null}
      {onRemove ? (
        <Pressable
          accessibilityLabel={`사진 ${number} 삭제`}
          accessibilityRole="button"
          onPress={onRemove}
          style={styles.removeButton}
          testID={testID ? `${testID}-remove` : undefined}
        >
          <View style={styles.removeIcon}>
            <AppIcon name="close" size={12} color={theme.colors.onPrimary} />
          </View>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: PHOTO_TILE_SIZE,
    height: PHOTO_TILE_SIZE,
    flexShrink: 0,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    gap: theme.spacing[1],
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.borderButton,
  },
  photo: {
    backgroundColor: theme.colors.thumb2,
  },
  coverBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    backgroundColor: DARK_SCRIM,
    alignItems: "center",
    justifyContent: "center",
  },
  smallText: {
    fontSize: 11,
    lineHeight: 16,
  },
  uploading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: DARK_SCRIM,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[1],
  },
  track: {
    width: 52,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  trackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.onPrimary,
    opacity: 0.3,
  },
  fill: {
    height: "100%",
    backgroundColor: theme.colors.onPrimary,
  },
  failed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.dangerText,
    alignItems: "center",
    justifyContent: "center",
  },
  // 보이는 원은 20이지만 누르는 곳은 오른쪽 위 44×44.
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: theme.spacing[1],
  },
  removeIcon: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    backgroundColor: DARK_SCRIM,
    alignItems: "center",
    justifyContent: "center",
  },
});
