import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon, type AppIconName } from "./app-icon";
import { AppText } from "./app-text";

export type InfoBoxTone = "info" | "success" | "warning" | "danger";

/** 톤별 바탕(*-subtle)·아이콘(*-icon)·행동 글자(*-text, 정보는 primary-strong). */
const tones: Record<
  InfoBoxTone,
  { bg: string; icon: string; action: string; iconName: AppIconName }
> = {
  info: {
    bg: theme.colors.infoSubtle,
    icon: theme.colors.infoIcon,
    action: theme.colors.primaryStrong,
    iconName: "info",
  },
  success: {
    bg: theme.colors.successSubtle,
    icon: theme.colors.successIcon,
    action: theme.colors.successText,
    iconName: "check-circle",
  },
  warning: {
    bg: theme.colors.warningSubtle,
    icon: theme.colors.warningIcon,
    action: theme.colors.warningText,
    iconName: "warning-amber",
  },
  danger: {
    bg: theme.colors.dangerSubtle,
    icon: theme.colors.dangerIcon,
    action: theme.colors.dangerText,
    iconName: "error-outline",
  },
};

/**
 * 상태·안내 상자(디자인 시스템 InfoBox). 아이콘 + 제목 + 한 줄 설명 + 오른쪽 행동 하나.
 * 제목·설명 글자는 톤과 상관없이 text·text-muted 이고, 톤 색은 바탕·아이콘·행동에만 쓴다.
 * 한 화면에 하나만 둔다.
 */
export function InfoBox({
  tone = "info",
  title,
  description,
  icon,
  action,
  style,
  testID,
}: {
  tone?: InfoBoxTone;
  title?: string;
  description?: string;
  /** 톤 기본 아이콘 대신 쓸 아이콘. */
  icon?: AppIconName;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const palette = tones[tone];

  return (
    <View
      testID={testID}
      style={[styles.box, { backgroundColor: palette.bg }, style]}
    >
      <AppIcon name={icon ?? palette.iconName} size={20} color={palette.icon} />
      <View style={styles.body}>
        {title ? (
          <AppText variant="label" weight="bold">
            {title}
          </AppText>
        ) : null}
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={actionHitSlop}
          onPress={action.onPress}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={{ color: palette.action }}
          >
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** 12/18 글자 행동 버튼의 누르는 영역을 위아래 44 까지 넓힌다. */
const actionHitSlop = {
  top: (theme.layout.touchTarget - theme.typography.caption.lineHeight) / 2,
  bottom: (theme.layout.touchTarget - theme.typography.caption.lineHeight) / 2,
  left: theme.spacing["3"],
  right: theme.spacing["3"],
};

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing["3"],
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing["4"],
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
