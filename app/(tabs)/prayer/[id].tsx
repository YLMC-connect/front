import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Textarea,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useAuth } from "../../../src/hooks/useAuth";
import {
  useJoinPrayerRoom,
  useLeavePrayerRoom,
  useMarkPrayerTopicPrayed,
  usePrayerRoom,
  useRecordPrayerAnswer,
} from "../../../src/hooks/usePrayers";
import type { PrayerTopic } from "../../../src/types/prayer";

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = id ?? "";
  const { currentUser } = useAuth();
  const { data: room, isError } = usePrayerRoom(roomId);
  const join = useJoinPrayerRoom(roomId);
  const leave = useLeavePrayerRoom(roomId);
  const markPrayed = useMarkPrayerTopicPrayed(roomId);
  const recordAnswer = useRecordPrayerAnswer(roomId);
  const [answerTarget, setAnswerTarget] = useState<PrayerTopic | null>(null);
  const [answer, setAnswer] = useState("");
  const [toast, setToast] = useState("");

  if (isError)
    return (
      <Screen>
        <EmptyState title="존재하지 않는 기도방입니다" icon="error-outline" />
      </Screen>
    );
  if (!room)
    return (
      <Screen>
        <Text style={styles.meta}>기도방을 불러오는 중입니다.</Text>
      </Screen>
    );

  const submitAnswer = () => {
    if (!answerTarget || !answer.trim()) return;
    recordAnswer.mutate(
      { topicId: answerTarget.id, answer: answer.trim() },
      {
        onSuccess: () => {
          setAnswer("");
          setAnswerTarget(null);
          setToast("응답 내용을 기록했습니다.");
        },
      },
    );
  };

  return (
    <Screen>
      <TopBar
        title="기도방"
        back
        onBack={() => router.back()}
        right={
          <Link
            href={{ pathname: "/modal/prayer-new", params: { roomId } }}
            asChild
          >
            <Pressable style={styles.iconButton}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </Pressable>
          </Link>
        }
      />

      <Card style={styles.roomCard}>
        <View style={styles.roomIcon}>
          <MaterialIcons
            name="volunteer-activism"
            size={34}
            color={theme.colors.danger}
          />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{room.title}</Text>
          <Badge tone={room.isJoined ? "success" : "primary"}>
            {room.isJoined ? "참여중" : "참여 가능"}
          </Badge>
        </View>
        <Text style={styles.description}>{room.description}</Text>
        <View style={styles.leader}>
          <Avatar name={room.leader.name} size={34} />
          <Text style={styles.meta}>
            {room.leader.name} · {room.memberCount}명 참여
          </Text>
        </View>
      </Card>

      {room.isJoined ? (
        <Button
          variant="soft"
          onPress={() =>
            leave.mutate(undefined, {
              onSuccess: () => setToast("기도방에서 나왔습니다."),
            })
          }
        >
          기도방 나가기
        </Button>
      ) : (
        <Button
          onPress={() =>
            join.mutate(undefined, {
              onSuccess: () => setToast("기도방에 참여했습니다."),
            })
          }
        >
          참여 신청
        </Button>
      )}

      <Section title="기도제목">
        <View style={styles.topicList}>
          {room.topics.length === 0 ? (
            <EmptyState
              title="기도제목이 없습니다"
              description="첫 기도제목을 나눠보세요."
              icon="favorite-border"
            />
          ) : null}
          {room.topics.map((topic) => {
            const isMine = topic.author.id === currentUser?.id;
            return (
              <Card key={topic.id} style={styles.topicCard}>
                <View style={styles.topicHeader}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  {topic.isAnswered ? <Badge tone="success">응답</Badge> : null}
                </View>
                <Text style={styles.topicContent}>{topic.content}</Text>
                {topic.isAnswered && topic.answer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerTitle}>응답 감사</Text>
                    <Text style={styles.topicContent}>{topic.answer}</Text>
                  </View>
                ) : null}
                <View style={styles.topicFooter}>
                  <Text style={styles.meta}>
                    {topic.isAnonymous ? "익명" : topic.author.name} ·{" "}
                    {topic.prayerCount}명 기도
                  </Text>
                  <View style={styles.topicActions}>
                    <Button
                      variant={topic.hasPrayed ? "soft" : "primary"}
                      disabled={topic.hasPrayed}
                      onPress={() =>
                        markPrayed.mutate(topic.id, {
                          onSuccess: () => setToast("함께 기도했습니다."),
                        })
                      }
                    >
                      기도했어요
                    </Button>
                    {isMine && !topic.isAnswered ? (
                      <Button
                        variant="ghost"
                        onPress={() => setAnswerTarget(topic)}
                      >
                        응답 기록
                      </Button>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </Section>

      <BottomSheet
        visible={!!answerTarget}
        title="응답 기록"
        onClose={() => setAnswerTarget(null)}
      >
        <View style={styles.sheetForm}>
          <Textarea
            value={answer}
            onChangeText={setAnswer}
            placeholder="응답받은 내용을 짧게 남겨주세요."
          />
          <Button onPress={submitAnswer} loading={recordAnswer.isPending}>
            기록
          </Button>
        </View>
      </BottomSheet>
      <Toast message={toast} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  roomCard: { gap: 12 },
  roomIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF4F1",
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  description: { color: theme.colors.inkSoft, fontSize: 15, lineHeight: 23 },
  leader: { flexDirection: "row", alignItems: "center", gap: 10 },
  meta: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  topicList: { gap: 12 },
  topicCard: { gap: 10 },
  topicHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  topicTitle: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  topicContent: { color: theme.colors.inkSoft, lineHeight: 21 },
  answerBox: {
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: theme.colors.sageSoft,
    gap: 4,
  },
  answerTitle: { color: theme.colors.ink, fontWeight: "900" },
  topicFooter: { gap: 10 },
  topicActions: { flexDirection: "row", gap: 8 },
  sheetForm: { gap: 12 },
});
