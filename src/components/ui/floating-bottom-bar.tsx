import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { Button } from "./buttons";
import { GlassBackdrop } from "./glass-backdrop";

export const FLOATING_BOTTOM_BAR_INSET = 130;

export interface FloatingBottomBarSecondaryAction {
  /** 보조 버튼 문구 (왼쪽, Secondary) */
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export interface FloatingBottomBarProps {
  /** 단일 기본 액션 버튼 문구 */
  label?: string;
  /** 버튼 클릭 핸들러 */
  onPress?: () => void;
  /** 버튼 로딩 상태 */
  loading?: boolean;
  /** 버튼 비활성화 상태 */
  disabled?: boolean;
  /** 버튼 스타일 변형 (기본 primary, 위험 danger) */
  variant?: "primary" | "danger";
  /** 두 버튼일 때 왼쪽에 놓이는 보조 버튼. label 이 있을 때만 쓴다. */
  secondary?: FloatingBottomBarSecondaryAction;
  /** 커스텀 버튼 또는 입력창 등 내부 콘텐츠 직접 전달 시 */
  children?: ReactNode;
  /** 외부 컨테이너 추가 스타일 */
  style?: StyleProp<ViewStyle>;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 상세·작성 화면 아래에 고정되는 주 버튼 자리.
 * 안쪽 24/20/32(안전 영역이 더 크면 안전 영역), 바탕은 bg 그라데이션 + 흐림.
 */
export function FloatingBottomBar({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  secondary,
  children,
  style,
  testID,
}: FloatingBottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, theme.spacing["8"]);

  const primary = label ? (
    <Button
      disabled={disabled}
      loading={loading}
      onPress={onPress}
      size="lg"
      testID={testID}
      variant={variant}
    >
      {label}
    </Button>
  ) : null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: bottomInset }, style]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <GlassBackdrop
        intensity={12}
        testID={`${testID ?? "floating-bottom-bar"}-glass`}
        tintOpacity={0}
      />
      <LinearGradient
        colors={["rgba(246,247,249,0)", theme.colors.bg]}
        locations={[0, 0.45]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        testID={testID ? `${testID}-gradient` : undefined}
      />
      {children ??
        (secondary && primary ? (
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Button
                disabled={secondary.disabled}
                onPress={secondary.onPress}
                size="lg"
                testID={secondary.testID}
                variant="secondary"
              >
                {secondary.label}
              </Button>
            </View>
            <View style={styles.rowItem}>{primary}</View>
          </View>
        ) : (
          primary
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing["6"],
    zIndex: theme.zIndex.header,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing["2"],
  },
  rowItem: {
    flex: 1,
  },
});
