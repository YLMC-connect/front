import { AppIcon } from "@/components/ui/app-icon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Empty,
  FloatingBottomBar,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useRequestPrayerTopicAnswer } from "../../../src/hooks/usePrayers";
import { fetchMyPrayerTopics } from "../../../src/services/prayerService";
import type {
  PrayerTopicDto,
  PrayerTopicStatus,
} from "../../../src/types/prayerApi";

type RequestStatusTone = "primary" | "mute" | "warn" | "danger";

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
  const requestAnswerMutation = useRequestPrayerTopicAnswer();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const topics = useQuery({
    queryKey: ["prayer", "my-topics", "request-screen"],
    queryFn: fetchMyPrayerTopics,
  });

  const rawTopics = topics.data ?? [];
  const rows = rawTopics.map((topic: PrayerTopicDto) => ({
    id: String(topic.id),
    title: topic.title,
    category: topic.categoryName,
    status: topicStatusLabel[topic.status]?.label ?? "검토중",
    desc: topic.content,
    tone: topicStatusLabel[topic.status]?.tone ?? "mute",
    active: selectedId === String(topic.id),
    canRequestAnswer: topic.status === "OPEN",
  }));

  const selectedItem = rows.find((r) => r.active);

  const handleRequestAnswer = () => {
    if (!selectedItem) {
      Alert.alert("알림", "응답완료를 요청할 기도제목을 먼저 선택해주세요.");
      return;
    }

    if (!selectedItem.canRequestAnswer) {
      Alert.alert(
        "요청 불가",
        "현재 '공개중'인 기도제목만 응답완료를 요청할 수 있습니다.",
      );
      return;
    }

    Alert.alert(
      "기도 응답완료 요청",
      `'${selectedItem.title}' 기도제목의 응답완료를 요청하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "요청하기",
          onPress: () => {
            requestAnswerMutation.mutate(
              {
                topicId: selectedItem.id,
                input: { answerContent: "기도에 응답해 주셨습니다." },
              },
              {
                onSuccess: () => {
                  Alert.alert(
                    "요청 완료",
                    "기도 응답완료 요청이 접수되었습니다.",
                  );
                  setSelectedId(null);
                },
                onError: (err) => {
                  Alert.alert(
                    "요청 실패",
                    err instanceof Error
                      ? err.message
                      : "응답완료 요청에 실패했습니다.",
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="내 기도제목" back />
        <ScrollView contentContainerStyle={styles.body}>
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
            {topics.isPending ? (
              <Text style={styles.desc}>
                서버에서 기도제목을 불러오는 중입니다.
              </Text>
            ) : null}
            {topics.isError ? (
              <Text style={styles.desc}>기도제목을 다시 불러와주세요.</Text>
            ) : null}
            {!topics.isPending && !topics.isError && rows.length === 0 ? (
              <Empty
                icon="hands-pray"
                title="등록된 기도제목이 없어요"
                description="기도제목을 작성하여 중보기도를 요청해보세요."
              />
            ) : null}
            {rows.map((request) => (
              <Pressable
                accessibilityRole="button"
                key={request.id}
                onPress={() =>
                  setSelectedId((prev) =>
                    prev === request.id ? null : request.id,
                  )
                }
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

        <FloatingBottomBar
          disabled={!selectedItem || requestAnswerMutation.isPending}
          label="응답완료 요청하기"
          loading={requestAnswerMutation.isPending}
          onPress={handleRequestAnswer}
          testID="prayer-request"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
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
    flex: 1,
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
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: 24,
  },
  submitButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
});
