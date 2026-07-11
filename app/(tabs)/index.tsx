import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { Avatar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";

const activityItems = [
  {
    title: "내 소모임",
    value: "청년 1부 큐티모임 외 2개",
    desc: "최근 글: 마가복음 8장 함께 묵상해요",
    color: theme.colors.primary,
  },
  {
    title: "내 기도",
    value: "월요일 오전 기도방",
    desc: "오늘 기도 완료 전",
    color: "#8A5D34",
  },
  {
    title: "삶공부 진행",
    value: "하나님 나라의 복음 3주차",
    desc: "이번 주 수강 전",
    color: "#5F6FA6",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen padded={false} testID="screen-home">
      <View style={styles.top}>
        <Text style={styles.brand}>열린문 커넥트</Text>
        <Pressable
          testID="home-open-mypage"
          accessibilityLabel="내 정보 보기"
          style={styles.profileCard}
          onPress={() => router.push("/mypage")}
        >
          <Avatar name="김은혜" size={42} seed="김은혜" />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>김은혜님</Text>
          </View>
          <View style={styles.profileAction}>
            <Text style={styles.profileActionText}>내 정보 보기</Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primaryDeep}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.prayerCard}>
          <View style={styles.prayerOrb} />
          <MaterialIcons
            name="volunteer-activism"
            size={56}
            color="rgba(255,255,255,0.22)"
            style={styles.prayerIcon}
          />
          <Text style={styles.prayerEyebrow}>오늘의 기도제목</Text>
          <Text style={styles.prayerTitle}>
            가정과 일터에서 믿음의 선택을 하도록 기도합니다.
          </Text>
          <Text style={styles.prayerMeta}>월요일 공통 기도제목</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 활동 요약</Text>
          <View style={styles.activityList}>
            {activityItems.map((item) => (
              <Pressable key={item.title} style={styles.activityCard}>
                <View
                  style={[
                    styles.activityAccent,
                    { backgroundColor: item.color },
                  ]}
                />
                <View style={styles.activityText}>
                  <Text style={styles.activityLabel}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.activityValue}>
                    {item.value}
                  </Text>
                  <Text numberOfLines={1} style={styles.activityDesc}>
                    {item.desc}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={18}
                  color={theme.colors.inkMute}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  brand: {
    marginBottom: 10,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  profileCard: {
    minHeight: 68,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.xl,
    lineHeight: 23,
    fontWeight: "900",
  },
  profileAction: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  profileActionText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.md,
    lineHeight: 17,
    fontWeight: "800",
  },
  body: {
    gap: 12,
  },
  prayerCard: {
    marginHorizontal: 18,
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    backgroundColor: "#516B4A",
    padding: 18,
    minHeight: 150,
    ...theme.shadow.raised,
  },
  prayerOrb: {
    position: "absolute",
    right: -22,
    bottom: -38,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  prayerIcon: {
    position: "absolute",
    right: -10,
    top: -10,
  },
  prayerEyebrow: {
    color: "rgba(255,255,255,0.84)",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  prayerTitle: {
    marginTop: 8,
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    lineHeight: 24,
    fontWeight: "800",
  },
  prayerMeta: {
    marginTop: 10,
    color: "rgba(255,255,255,0.88)",
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  activityList: {
    paddingHorizontal: 18,
    gap: 10,
  },
  activityCard: {
    minHeight: 72,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  activityAccent: {
    alignSelf: "stretch",
    width: 6,
    borderRadius: theme.radius.pill,
  },
  activityText: {
    flex: 1,
    minWidth: 0,
  },
  activityLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  activityValue: {
    marginTop: 5,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    lineHeight: 20,
    fontWeight: "800",
  },
  activityDesc: {
    marginTop: 3,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
});
