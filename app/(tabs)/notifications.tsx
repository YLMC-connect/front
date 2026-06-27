import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";

type NotificationItem = {
  type: "group" | "pray" | "market" | "study" | "system";
  who: string;
  what: string;
  ago: string;
  unread?: boolean;
};

const today: NotificationItem[] = [
  {
    type: "group",
    who: "화요 자녀 중보방",
    what: "에 새 멤버가 가입했어요",
    ago: "10분 전",
    unread: true,
  },
  {
    type: "pray",
    who: "김은혜 집사님",
    what: "이 기도제목에 응원을 남겼어요",
    ago: "1시간 전",
    unread: true,
  },
  {
    type: "market",
    who: "유아용 카시트",
    what: " 게시글에 댓글이 달렸어요",
    ago: "2시간 전",
    unread: true,
  },
];

const earlier: NotificationItem[] = [
  {
    type: "study",
    who: "제자훈련 1단계",
    what: "의 새 자료가 등록되었어요",
    ago: "어제",
  },
  {
    type: "group",
    who: "토요 산악회",
    what: "의 새 공지가 올라왔어요",
    ago: "어제",
  },
  {
    type: "pray",
    who: "박은혜 권사님",
    what: "의 기도제목이 응답되었어요",
    ago: "2일 전",
  },
  {
    type: "system",
    who: "운영자",
    what: "서비스 점검 안내",
    ago: "3일 전",
  },
  {
    type: "market",
    who: "전기밥솥 나눔",
    what: " 거래가 완료되었어요",
    ago: "5일 전",
  },
];

const iconByType: Record<
  NotificationItem["type"],
  keyof typeof MaterialIcons.glyphMap
> = {
  group: "groups",
  pray: "favorite",
  market: "shopping-bag",
  study: "menu-book",
  system: "notifications",
};

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title="알림"
          back
          onBack={() => router.back()}
          right={<Text style={styles.readAll}>모두 읽음</Text>}
        />
        <ScrollView contentContainerStyle={styles.body}>
          <SectionLabel>오늘</SectionLabel>
          {today.map((item) => (
            <NotificationRow key={`${item.who}-${item.ago}`} item={item} />
          ))}
          <SectionLabel>지난 알림</SectionLabel>
          {earlier.map((item) => (
            <NotificationRow key={`${item.who}-${item.ago}`} item={item} />
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <View style={[styles.row, item.unread ? styles.rowUnread : null]}>
      <View style={[styles.iconCircle, item.unread ? styles.iconUnread : null]}>
        <MaterialIcons
          name={iconByType[item.type]}
          size={18}
          color={item.unread ? theme.colors.white : theme.colors.inkMute}
        />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.message}>
          <Text style={styles.messageStrong}>{item.who}</Text>
          {item.what}
        </Text>
        <Text style={styles.ago}>{item.ago}</Text>
      </View>
      {item.unread ? <View style={styles.unreadDot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  readAll: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  body: {
    paddingBottom: 24,
  },
  sectionLabel: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowUnread: {
    backgroundColor: theme.colors.primarySoft,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconUnread: {
    backgroundColor: theme.colors.primary,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.md,
  },
  messageStrong: {
    fontWeight: theme.fontWeight.bold,
  },
  ago: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
});
