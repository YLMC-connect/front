import { AppIcon } from "@/components/ui/app-icon";
import { InfoBox } from "@/components/ui/info-box";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Empty,
  FloatingBottomBar,
  ModalFormSection,
  ModalFormTextInput,
  MotionEnter,
  motionStaggerDelay,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useRequestPrayerTopicAnswer } from "../../../src/hooks/usePrayers";
import { fetchMyPrayerTopics } from "../../../src/services/prayerService";
import type {
  PrayerTopicDto,
  PrayerTopicStatus,
} from "../../../src/types/prayerApi";

type RequestStatusTone = "info" | "neutral" | "warning" | "danger";

/** 목록 첫 진입: 처음 8개만 60ms 간격으로 떠오른다. */
const STAGGER_LIMIT = 8;

const topicStatusLabel: Record<
  PrayerTopicStatus,
  { label: string; tone: RequestStatusTone }
> = {
  REVIEW: { label: "검토중", tone: "warning" },
  OPEN: { label: "공개중", tone: "info" },
  REJECTED: { label: "반려", tone: "danger" },
  ANSWER_REQUESTED: { label: "응답 요청", tone: "neutral" },
  ANSWERED: { label: "응답됨", tone: "info" },
  HIDDEN: { label: "숨김", tone: "neutral" },
};

export default function PrayerRequestScreenRoute() {
  const requestAnswerMutation = useRequestPrayerTopicAnswer();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState("");

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
    tone: topicStatusLabel[topic.status]?.tone ?? "neutral",
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

    const answer = answerContent.trim();
    if (!answer) return;

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
                input: { answerContent: answer },
              },
              {
                onSuccess: () => {
                  Alert.alert(
                    "요청 완료",
                    "기도 응답완료 요청이 접수되었습니다.",
                  );
                  setSelectedId(null);
                  setAnswerContent("");
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
        <ScrollView
          contentContainerStyle={[
            styles.body,
            !topics.isPending && !topics.isError && rows.length === 0
              ? styles.bodyEmpty
              : null,
          ]}
        >
          <InfoBox
            title="기도제목은 승인 후 공개됩니다"
            description="이름, 개인정보, 민감 표현을 관리자가 검토한 뒤 중보기도요원에게 보여집니다."
            style={styles.notice}
          />

          <View
            style={[
              styles.stack,
              !topics.isPending && !topics.isError && rows.length === 0
                ? styles.stackEmpty
                : null,
            ]}
          >
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
            {rows.map((request, index) => (
              <MotionEnter
                key={request.id}
                enabled={index < STAGGER_LIMIT}
                mode="fadeUp"
                delay={motionStaggerDelay(index)}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setSelectedId((prev) =>
                      prev === request.id ? null : request.id,
                    )
                  }
                  style={[
                    styles.card,
                    request.active ? styles.cardActive : null,
                  ]}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.requestText}>
                      <View style={styles.badgeRow}>
                        <Badge tone="neutral">{request.category}</Badge>
                        <Badge tone={request.tone}>{request.status}</Badge>
                        {request.active ? (
                          <Badge tone="info">선택됨</Badge>
                        ) : null}
                      </View>
                      <Text style={styles.title}>{request.title}</Text>
                      <Text style={styles.desc}>{request.desc}</Text>
                    </View>
                    <AppIcon
                      name="chevron-right"
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </Pressable>
              </MotionEnter>
            ))}
          </View>

          {selectedItem?.canRequestAnswer ? (
            <View style={styles.answerSection}>
              <ModalFormSection
                label="응답 내용"
                required
                hint={`${answerContent.length}/500`}
              >
                <ModalFormTextInput
                  accessibilityLabel="응답 내용"
                  multiline
                  maxLength={500}
                  onChangeText={setAnswerContent}
                  placeholder="어떻게 기도에 응답받으셨는지 나눠주세요"
                  testID="prayer-request-answer"
                  textAlignVertical="top"
                  value={answerContent}
                />
              </ModalFormSection>
            </View>
          ) : null}
        </ScrollView>

        <FloatingBottomBar
          disabled={
            !selectedItem ||
            (selectedItem.canRequestAnswer && !answerContent.trim()) ||
            requestAnswerMutation.isPending
          }
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
  bodyEmpty: {
    paddingBottom: 112,
  },
  notice: {
    marginBottom: 14,
  },
  stack: {
    flex: 1,
    gap: 10,
  },
  stackEmpty: {
    justifyContent: "center",
  },
  answerSection: {
    marginHorizontal: -18,
  },
  card: {
    borderRadius: theme.radius.md,
    borderColor: "transparent",
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.sm,
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
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    marginTop: 5,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
