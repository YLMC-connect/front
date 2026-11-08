import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { Avatar } from "./display";
import { Text } from "./text";

/**
 * 디자인 시스템 NotificationItem. 누가(700) 무엇을 했는지 한 문장으로, 시간은 아래 줄.
 * 읽지 않은 알림은 `info-subtle` 바탕 + 오른쪽 위 6px `danger-icon` 점.
 */
export function NotificationItem({
  name,
  action,
  timeLabel,
  unread = false,
  avatarUri,
  onPress,
  testID,
}: {
  /** 행동한 사람 이름(굵게). */
  name: string;
  /** 이름 뒤에 이어지는 행동 문장. 예: "님이 댓글을 남겼어요." */
  action: string;
  timeLabel: string;
  unread?: boolean;
  avatarUri?: string | null;
  onPress?: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${unread ? "읽지 않음, " : ""}${name}${action} ${timeLabel}`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread ? styles.unread : null,
        pressed ? styles.pressed : null,
      ]}
      testID={testID}
    >
      <Avatar name={name} size={40} uri={avatarUri} />
      <View style={styles.texts}>
        <Text style={styles.sentence}>
          <Text style={styles.name}>{name}</Text>
          {action}
        </Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>
      {unread ? (
        <View
          style={styles.dot}
          testID={testID ? `${testID}-unread-dot` : undefined}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
    paddingVertical: theme.spacing["3"],
    paddingHorizontal: theme.spacing["4"],
  },
  unread: {
    backgroundColor: theme.colors.infoSubtle,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  sentence: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  name: {
    fontFamily: theme.font.bold,
    fontWeight: "normal",
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  dot: {
    position: "absolute",
    top: theme.spacing["3"],
    right: theme.spacing["4"],
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.dangerIcon,
  },
});
