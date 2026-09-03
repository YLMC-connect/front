import { AppIcon } from "@/components/ui/app-icon";
import { useRef, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { useMotionPresence } from "./motion";

type IconName = ComponentProps<typeof AppIcon>["name"];

export function EmptyState({
  title,
  description,
  icon = "inbox",
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <AppIcon name={icon} size={42} color={theme.colors.inkHint} />
      </View>
      <AppText variant="cardTitle" tone="secondary" style={styles.stateTitle}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" tone="muted" style={styles.stateText}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.stateAction}
        >
          <AppText variant="caption" tone="brand">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message = "잠시 후 다시 시도해주세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <AppIcon name="error-outline" size={42} color={theme.colors.inkHint} />
      </View>
      <AppText variant="cardTitle" tone="secondary" style={styles.stateTitle}>
        불러오지 못했습니다
      </AppText>
      <AppText variant="caption" tone="muted" style={styles.stateText}>
        {message}
      </AppText>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
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
        <AppIcon name="check" size={38} color={theme.colors.success} />
      </View>
      <AppText variant="cardTitle">{title}</AppText>
      {description ? (
        <AppText variant="caption" tone="muted" style={styles.stateText}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.stateAction}
        >
          <AppText variant="caption" tone="brand">
            {actionLabel}
          </AppText>
        </Pressable>
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
  const contentRef = useRef(message);
  if (message) contentRef.current = message;
  const { mounted, progress } = useMotionPresence(Boolean(message), {
    duration: theme.motion.duration.base,
  });
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [theme.motion.distance.sm, 0],
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
      <AppIcon name={icon} size={18} color="#fff" />
      <Text style={styles.toastText}>{contentRef.current}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  stateIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
  },
  stateTitle: {
    textAlign: "center",
  },
  stateText: {
    textAlign: "center",
  },
  stateAction: {
    minHeight: theme.layout.touchTarget,
    marginTop: theme.spacing[1],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[5],
    alignItems: "center",
    justifyContent: "center",
  },
  successStateIcon: {
    backgroundColor: "#EDF5EA",
  },
  retryButton: {
    minHeight: 44,
    marginTop: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 40,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: theme.colors.toast,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadow.toast,
  },
  toastText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
