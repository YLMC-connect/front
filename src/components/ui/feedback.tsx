import { AppIcon } from "@/components/ui/app-icon";
import { useState, type ComponentProps } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/text";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { Button } from "./buttons";
import { useMotionPresence } from "./motion";

type IconName = ComponentProps<typeof AppIcon>["name"];

export type EmptyProps = {
  title: string;
  description?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Empty({
  title,
  description,
  icon = "inbox",
  style,
  testID,
}: EmptyProps) {
  return (
    <View style={[styles.state, style]} testID={testID}>
      <View style={styles.stateIcon}>
        <AppIcon name={icon} size={36} color={theme.colors.primaryStrong} />
      </View>
      <AppText variant="heading" style={styles.stateTitle}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="label" tone="muted" style={styles.stateText}>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

export const EmptyState = Empty;

export function ErrorState({
  message = "잠시 후 다시 시도해주세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, styles.errorStateIcon]}>
        <AppIcon
          name="error-outline"
          size={36}
          color={theme.colors.dangerIcon}
        />
      </View>
      <AppText variant="heading" style={styles.stateTitle}>
        불러오지 못했습니다
      </AppText>
      <AppText variant="label" tone="muted" style={styles.stateText}>
        {message}
      </AppText>
      {onRetry ? (
        <View style={styles.stateActionWrap}>
          <Button variant="secondary" onPress={onRetry}>
            다시 시도
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export function SuccessState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, styles.successStateIcon]}>
        <AppIcon name="check" size={36} color={theme.colors.successIcon} />
      </View>
      <AppText variant="heading" style={styles.stateTitle}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="label" tone="muted" style={styles.stateText}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.stateActionWrap}>
          <Button variant="secondary" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export function Toast({
  message,
  offset = 28,
  icon = "check",
}: {
  message?: string;
  offset?: number;
  icon?: IconName;
}) {
  const [content, setContent] = useState(message);
  if (message && message !== content) {
    setContent(message);
  }
  // 16px 아래에서 느림(300ms)으로 올라오고, 사라질 때는 60%(180ms).
  const { mounted, progress } = useMotionPresence(Boolean(message), {
    duration: theme.motion.duration.slow,
  });
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [theme.motion.distance.lg, 0],
        ),
      },
    ],
  }));

  if (!mounted) return null;
  return (
    <Animated.View
      testID="motion-toast"
      style={[styles.toast, { bottom: offset }, animatedStyle]}
    >
      <AppIcon name={icon} size={18} color={theme.colors.successIcon} />
      <Text style={styles.toastText}>{content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 88,
    gap: 12,
  },
  stateIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySubtle,
  },
  stateTitle: {
    textAlign: "center",
  },
  stateText: {
    textAlign: "center",
    fontWeight: theme.fontWeight.regular,
    lineHeight: 22,
  },
  stateActionWrap: {
    marginTop: theme.spacing["1"],
  },
  errorStateIcon: {
    backgroundColor: theme.colors.dangerSubtle,
  },
  successStateIcon: {
    backgroundColor: theme.colors.successSubtle,
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: theme.zIndex.toast,
    minHeight: 52,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing["4"],
    paddingVertical: theme.spacing["3"],
    ...theme.shadow.lg,
  },
  toastText: {
    ...theme.typography.label,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
});
