import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { AppText, Avatar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";

const activityItems = [
  {
    title: "내 소모임",
    value: "청년 1부 큐티모임 외 2개",
    desc: "최근 글: 마가복음 8장 함께 묵상해요",
    color: theme.colors.primary,
    href: "/group",
  },
  {
    title: "내 기도",
    value: "월요일 오전 기도방",
    desc: "오늘 기도 완료 전",
    color: "#8A5D34",
    href: "/prayer",
  },
  {
    title: "삶공부 진행",
    value: "하나님 나라의 복음 3주차",
    desc: "이번 주 수강 전",
    color: "#5F6FA6",
    href: "/life-study",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen padded={false} testID="screen-home">
      <View style={styles.top}>
        <AppText variant="caption" tone="brand" style={styles.brand}>
          열린문 커넥트
        </AppText>
        <Pressable
          testID="home-open-mypage"
          accessibilityLabel="내 정보 보기"
          accessibilityRole="button"
          style={styles.profileCard}
          onPress={() => router.push("/mypage")}
        >
          <Avatar name="김은혜" size={42} seed="김은혜" />
          <View style={styles.profileText}>
            <AppText variant="sectionTitle">김은혜님</AppText>
          </View>
          <View style={styles.profileAction}>
            <AppText variant="caption" tone="brand">
              내 정보 보기
            </AppText>
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
          <AppText
            variant="caption"
            tone="inverse"
            style={styles.prayerEyebrow}
          >
            오늘의 기도제목
          </AppText>
          <AppText
            variant="sectionTitle"
            tone="inverse"
            style={styles.prayerTitle}
          >
            가정과 일터에서 믿음의 선택을 하도록 기도합니다.
          </AppText>
          <AppText variant="caption" tone="inverse" style={styles.prayerMeta}>
            월요일 공통 기도제목
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            내 활동 요약
          </AppText>
          <View style={styles.activityList}>
            {activityItems.map((item) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                onPress={() => router.push(item.href as Href)}
                style={styles.activityCard}
              >
                <View
                  style={[
                    styles.activityAccent,
                    { backgroundColor: item.color },
                  ]}
                />
                <View style={styles.activityText}>
                  <AppText variant="caption" tone="muted">
                    {item.title}
                  </AppText>
                  <AppText
                    numberOfLines={1}
                    variant="cardTitle"
                    style={styles.activityValue}
                  >
                    {item.value}
                  </AppText>
                  <AppText
                    numberOfLines={1}
                    variant="caption"
                    tone="secondary"
                    style={styles.activityDesc}
                  >
                    {item.desc}
                  </AppText>
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
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 8,
    paddingBottom: 14,
  },
  brand: {
    marginBottom: 10,
  },
  profileCard: {
    minHeight: 68,
    borderRadius: theme.radius.lg,
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
  profileAction: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  body: {
    gap: theme.layout.sectionGap,
  },
  prayerCard: {
    marginHorizontal: theme.layout.screenX,
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    backgroundColor: "#516B4A",
    padding: theme.spacing[5],
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
    opacity: 0.84,
  },
  prayerTitle: {
    marginTop: 8,
  },
  prayerMeta: {
    marginTop: 10,
    opacity: 0.88,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: theme.spacing[3],
  },
  activityList: {
    paddingHorizontal: theme.layout.screenX,
    gap: theme.spacing[3],
  },
  activityCard: {
    minHeight: 84,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.listGap,
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
  activityValue: {
    marginTop: theme.spacing[1],
  },
  activityDesc: {
    marginTop: 3,
  },
});
