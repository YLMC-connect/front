import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

export const FLOATING_BOTTOM_BAR_INSET = 130;

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
  /** 커스텀 버튼 또는 입력창 등 내부 콘텐츠 직접 전달 시 */
  children?: ReactNode;
  /** 외부 컨테이너 추가 스타일 */
  style?: StyleProp<ViewStyle>;
  /** 테스트 ID */
  testID?: string;
}

export function FloatingBottomBar({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  children,
  style,
  testID,
}: FloatingBottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 24);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: bottomInset }, style]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <LinearGradient
        colors={[
          "rgba(246,247,249,0)",
          "rgba(246,247,249,0.78)",
          "rgba(246,247,249,0.96)",
        ]}
        locations={[0, 0.38, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        testID={testID ? `${testID}-gradient` : undefined}
      />
      {children ??
        (label ? (
          <MotionPressable
            accessibilityRole="button"
            disabled={disabled || loading}
            onPress={onPress}
            pressedScale={0.98}
            style={[
              styles.button,
              variant === "danger" ? styles.buttonDanger : styles.buttonPrimary,
              (disabled || loading) && styles.buttonDisabled,
            ]}
            testID={testID}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  disabled && !loading ? styles.buttonTextDisabled : null,
                ]}
              >
                {label}
              </Text>
            )}
          </MotionPressable>
        ) : null)}
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
    paddingTop: 24,
    zIndex: 10,
  },
  button: {
    height: 52,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  buttonTextDisabled: {
    color: theme.colors.inkHint,
  },
});
