import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "../../../src/components/layout/Screen";
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
import { MARKET_REPORT_REASONS } from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import {
  useAddMarketComment,
  useMarketItem,
  useReportMarketItem,
  useToggleMarketLike,
  useUpdateMarketStatus,
} from "../../../src/hooks/useMarketItems";
import type { MarketStatus } from "../../../src/types/market";

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = id ?? "";
  const { data: item, isError } = useMarketItem(itemId);
  const updateStatus = useUpdateMarketStatus(itemId);
  const toggleLike = useToggleMarketLike(itemId);
  const addComment = useAddMarketComment(itemId);
  const report = useReportMarketItem(itemId);
  const [comment, setComment] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [toast, setToast] = useState("");

  const statusTone = useMemo(() => {
    if (!item) return "primary";
    return item.status === "reserved"
      ? "warn"
      : item.status === "done"
        ? "mute"
        : "primary";
  }, [item]);

  if (isError) {
    return (
      <Screen>
        <EmptyState title="존재하지 않는 나눔입니다" icon="error-outline" />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <Text style={styles.loading}>나눔 정보를 불러오는 중입니다.</Text>
      </Screen>
    );
  }

  const changeStatus = (status: MarketStatus) => {
    updateStatus.mutate(status, {
      onSuccess: () => {
        setSheetOpen(false);
        setToast("상태가 변경되었습니다.");
      },
    });
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment.trim(), {
      onSuccess: () => {
        setComment("");
        setToast("댓글을 등록했습니다.");
      },
    });
  };

  return (
    <Screen>
      <TopBar title="나눔 상세" back onBack={() => router.back()} />
      <View style={styles.hero}>
        {item.images[0] ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.heroImage}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons name="redeem" size={52} color="#fff" />
        )}
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.title}</Text>
        <Badge tone={statusTone}>
          {item.status === "sharing"
            ? "나눔중"
            : item.status === "reserved"
              ? "예약중"
              : "나눔완료"}
        </Badge>
      </View>
      <View style={styles.author}>
        <Avatar name={item.owner.name} />
        <View>
          <Text style={styles.authorName}>{item.owner.name}</Text>
          <Text style={styles.meta}>
            {item.location} · {item.condition}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.actions}>
        <Button
          variant={item.liked ? "danger" : "soft"}
          onPress={() =>
            toggleLike.mutate(undefined, {
              onSuccess: () =>
                setToast(
                  item.liked
                    ? "관심 목록에서 제거했습니다."
                    : "관심 목록에 담았습니다.",
                ),
            })
          }
          icon={item.liked ? "favorite" : "favorite-border"}
        >
          관심
        </Button>
        <Button variant="soft" onPress={() => setSheetOpen(true)} icon="sync">
          상태 변경
        </Button>
        <Button
          variant="ghost"
          onPress={() => setReportSheetOpen(true)}
          icon="flag"
        >
          신고
        </Button>
      </View>

      <Card style={styles.comments}>
        <Text style={styles.sectionTitle}>댓글 {item.comments.length}</Text>
        {item.comments.length === 0 ? (
          <Text style={styles.meta}>아직 댓글이 없습니다.</Text>
        ) : null}
        {item.comments.map((entry) => (
          <View key={entry.id} style={styles.comment}>
            <Avatar name={entry.author.name} size={30} />
            <View style={styles.commentBody}>
              <Text style={styles.commentAuthor}>{entry.author.name}</Text>
              <Text style={styles.commentText}>{entry.content}</Text>
            </View>
          </View>
        ))}
        <Textarea
          value={comment}
          onChangeText={setComment}
          placeholder="나눔 받을 수 있는 시간을 남겨주세요."
        />
        <Button onPress={submitComment} loading={addComment.isPending}>
          댓글 등록
        </Button>
      </Card>

      <BottomSheet
        visible={sheetOpen}
        title="나눔 상태 변경"
        onClose={() => setSheetOpen(false)}
      >
        <View style={styles.sheetActions}>
          <Button variant="soft" onPress={() => changeStatus("sharing")}>
            나눔중
          </Button>
          <Button variant="soft" onPress={() => changeStatus("reserved")}>
            예약중
          </Button>
          <Button onPress={() => changeStatus("done")}>나눔완료</Button>
        </View>
      </BottomSheet>
      <BottomSheet
        visible={reportSheetOpen}
        title="신고 사유 선택"
        onClose={() => setReportSheetOpen(false)}
      >
        <View style={styles.sheetActions}>
          {MARKET_REPORT_REASONS.map((reason) => (
            <Button
              key={reason.key}
              variant="soft"
              onPress={() =>
                report.mutate(reason.key, {
                  onSuccess: () => {
                    setReportSheetOpen(false);
                    setToast("신고가 접수되었습니다.");
                  },
                })
              }
            >
              {reason.label}
            </Button>
          ))}
        </View>
      </BottomSheet>
      <Toast message={toast} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { color: theme.colors.inkMute },
  hero: {
    height: 220,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.sage,
  },
  heroImage: { width: "100%", height: "100%" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  author: { flexDirection: "row", alignItems: "center", gap: 10 },
  authorName: { color: theme.colors.ink, fontWeight: "800" },
  meta: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  description: { color: theme.colors.inkSoft, fontSize: 15, lineHeight: 23 },
  actions: { flexDirection: "row", gap: 8 },
  comments: { gap: 12 },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: "900" },
  comment: { flexDirection: "row", gap: 10 },
  commentBody: {
    flex: 1,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  commentAuthor: {
    color: theme.colors.ink,
    fontWeight: "800",
    marginBottom: 3,
  },
  commentText: { color: theme.colors.inkSoft, lineHeight: 20 },
  sheetActions: { gap: 8 },
});
