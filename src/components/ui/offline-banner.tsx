import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { MotionFadeIn } from "./motion";
import { Text } from "./text";

/** 인터넷 연결 여부. 앱의 react-query onlineManager(NetInfo 연결)를 그대로 따른다. */
export function useIsOnline() {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

/**
 * 디자인 시스템 OfflineBanner. 인터넷이 끊기면 상단 바 아래에 띄우고,
 * 마지막으로 불러온 내용은 그대로 둔다. 연결이 돌아오면 저절로 사라지고
 * react-query 가 다시 불러온다(refetchOnReconnect).
 */
export function OfflineBanner({
  style,
  testID = "offline-banner",
}: {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const isOnline = useIsOnline();
  if (isOnline) return null;

  return (
    <MotionFadeIn>
      <View
        accessibilityLiveRegion="polite"
        style={[styles.banner, style]}
        testID={testID}
      >
        <AppIcon name="wifi-off" size={18} color={theme.colors.warningIcon} />
        <Text style={styles.text}>인터넷 연결이 끊겼어요</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => void NetInfo.refresh()}
          style={styles.retry}
          testID={`${testID}-retry`}
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    </MotionFadeIn>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: theme.size.buttonHeightSm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
    marginHorizontal: theme.layout.screenX,
    marginBottom: theme.spacing["3"],
    paddingLeft: theme.spacing["4"],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.warningSubtle,
  },
  text: {
    ...theme.typography.label,
    flex: 1,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.warningText,
  },
  retry: {
    minHeight: theme.size.buttonHeightSm,
    justifyContent: "center",
    paddingHorizontal: theme.spacing["4"],
  },
  retryText: {
    ...theme.typography.label,
    fontFamily: theme.font.bold,
    fontWeight: "normal",
    color: theme.colors.warningText,
  },
});
