import { AppIcon } from "@/components/ui/app-icon";
import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Badge, Empty, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  fetchMyPrayerTopics,
  resolvePrayerAdapterMode,
} from "../../../src/services/prayerService";
import type {
  PrayerTopicDto,
  PrayerTopicStatus,
} from "../../../src/types/prayerApi";

type RequestStatusTone = "primary" | "mute" | "warn" | "danger";

const requests: readonly {
  title: string;
  category: string;
  status: string;
  desc: string;
  tone: RequestStatusTone;
  active?: boolean;
}[] = [
  {
    title: "어머니 수술 후 회복",
    category: "치유",
    status: "검토중",
    desc: "개인정보 표현 검토 후 공개 예정",
    tone: "warn",
  },
  {
    title: "가족의 신앙 회복",
    category: "구원",
    status: "공개중",
    desc: "중보기도요원에게 공개 중",
    tone: "primary",
    active: true,
  },
  {
    title: "새로운 자리에서의 평안",
    category: "일반",
    status: "반려",
    desc: "개인정보 표현 수정이 필요합니다",
    tone: "danger",
  },
  {
    title: "공동체 적응 감사",
    category: "일반",
    status: "응답완료 요청중",
    desc: "관리자 승인 대기",
    tone: "mute",
  },
  {
    title: "자녀 학교 적응",
    category: "자녀",
    status: "응답완료",
    desc: "기도응답으로 보관되었습니다",
    tone: "primary",
  },
] as const;

const topicStatusLabel: Record<
  PrayerTopicStatus,
  { label: string; tone: RequestStatusTone }
> = {
  REVIEW: { label: "검토중", tone: "warn" },
  OPEN: { label: "공개중", tone: "primary" },
  REJECTED: { label: "반려", tone: "danger" },
  ANSWER_REQUESTED: { label: "응답 요청", tone: "mute" },
  ANSWERED: { label: "응답됨", tone: "primary" },
  HIDDEN: { label: "숨김", tone: "mute" },
};

export default function PrayerRequestScreenRoute() {
  const http = resolvePrayerAdapterMode() === "http";
  const topics = useQuery({
    queryKey: ["prayer", "my-topics", "request-screen"],
    queryFn: fetchMyPrayerTopics,
    enabled: http,
  });
  const rows = http
    ? (topics.data ?? []).map((topic: PrayerTopicDto) => ({
        title: topic.title,
        category: topic.categoryName,
        status: topicStatusLabel[topic.status].label,
        desc: topic.content,
        tone: topicStatusLabel[topic.status].tone,
        active: false,
      }))
    : requests;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="내 기도제목" back />
        <ScrollView contentContainerStyle={styles.body}>
          {__DEV__ && !http ? (
            <Text style={styles.desc}>목업 데이터</Text>
          ) : null}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              기도제목은 승인 후 공개됩니다
            </Text>
            <Text style={styles.noticeText}>
              이름, 개인정보, 민감 표현을 관리자가 검토한 뒤 중보기도요원에게
              보여집니다.
            </Text>
          </View>

          <View style={styles.stack}>
            {http && topics.isPending ? (
              <Text style={styles.desc}>
                서버에서 기도제목을 불러오는 중입니다.
              </Text>
            ) : null}
            {http && topics.isError ? (
              <Text style={styles.desc}>기도제목을 다시 불러와주세요.</Text>
            ) : null}
            {http && topics.isSuccess && rows.length === 0 ? (
              <Empty
                title="등록된 기도제목이 없어요"
                description="기도제목을 작성하여 중보기도를 요청해보세요."
              />
            ) : null}
            {rows.map((request) => (
              <Pressable
                accessibilityRole="button"
                key={request.title}
                style={[styles.card, request.active ? styles.cardActive : null]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.requestText}>
                    <View style={styles.badgeRow}>
                      <Badge tone="mute">{request.category}</Badge>
                      <Badge tone={request.tone}>{request.status}</Badge>
                      {request.active ? <Badge>선택됨</Badge> : null}
                    </View>
                    <Text style={styles.title}>{request.title}</Text>
                    <Text style={styles.desc}>{request.desc}</Text>
                  </View>
                  <AppIcon
                    name="chevron-right"
                    size={18}
                    color={theme.colors.inkHint}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <Pressable accessibilityRole="button" style={styles.submitButton}>
            <Text style={styles.submitText}>응답완료 요청하기</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 112,
  },
  noticeCard: {
    marginBottom: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primarySoft,
    padding: 15,
  },
  noticeTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.extrabold,
  },
  noticeText: {
    marginTop: 7,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  stack: {
    gap: 10,
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: theme.colors.surface,
    padding: 15,
    ...theme.shadow.card,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  requestText: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  title: {
    marginTop: 9,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.extrabold,
  },
  desc: {
    marginTop: 5,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  bottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
  },
  submitButton: {
    height: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
