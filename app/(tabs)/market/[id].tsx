import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  ConfirmDialog,
  ErrorState,
  RadioSheet,
  Toast,
  VisualThumb,
} from "../../../src/components/ui";
import { MARKET_REPORT_REASONS } from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import {
  useCreateMarketComment,
  useDeleteMarketComment,
  useDeleteMarketPost,
  useMarketDetail,
  useReportMarketContent,
  useUpdateMarketComment,
} from "../../../src/hooks/useMarket";
import { readDesignVariant } from "../../../src/lib/designVariant";
import { DuplicateMarketReportError } from "../../../src/services/marketService";
import type {
  MarketDetailComment,
  MarketReportInput,
  MarketReportReason,
} from "../../../src/types/market";

const reportReasonOptions = MARKET_REPORT_REASONS.map(({ key, label }) => ({
  value: key,
  label,
}));
type ReportTarget = Pick<MarketReportInput, "targetType" | "targetId">;

export default function MarketDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const id = params.id ?? "1";
  const variant = readDesignVariant(params.designVariant);
  const isReportSheetVariant =
    variant === "report" || variant === "report-other-input";
  const isReportVariant =
    isReportSheetVariant || variant === "report-dup-toast";
  const detail = useMarketDetail(id);
  const createComment = useCreateMarketComment(id);
  const updateComment = useUpdateMarketComment(id);
  const deleteComment = useDeleteMarketComment(id);
  const deletePost = useDeleteMarketPost(id);
  const reportContent = useReportMarketContent();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] =
    useState<MarketReportReason>("false_information");
  const [reportDetails, setReportDetails] = useState("");
  const [reportMessage, setReportMessage] = useState<string>();
  const [showDelete, setShowDelete] = useState(variant === "delete-confirm");
  const router = useRouter();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (isReportSheetVariant) {
      setReportTarget({ targetType: "market", targetId: id });
      setReportReason(
        variant === "report-other-input" ? "other" : "false_information",
      );
      setReportDetails(
        variant === "report-other-input"
          ? "홍보성 글 같아요. 같은 사진을 여러 번 올리는 것 같습니다."
          : "",
      );
      setReportMessage(undefined);
      return;
    }

    setReportTarget(null);
    setReportMessage(
      variant === "report-dup-toast" ? "이미 신고한 게시글입니다" : undefined,
    );
  }, [id, isReportSheetVariant, variant]);

  useEffect(() => {
    setShowDelete(variant === "delete-confirm");
  }, [variant]);

  if (variant === "deleted" || variant === "blocked") {
    return (
      <Screen>
        <View style={styles.exception}>
          <MaterialIcons
            name={variant === "deleted" ? "inventory-2" : "block"}
            size={42}
            color={theme.colors.inkHint}
          />
          <Text style={styles.exceptionTitle}>
            {variant === "deleted"
              ? "존재하지 않는 게시글입니다"
              : "확인할 수 없는 게시글입니다"}
          </Text>
          <Text style={styles.exceptionText}>
            {variant === "deleted"
              ? "삭제되었거나 더 이상 접근할 수 없는 게시글이에요."
              : "차단한 사용자의 게시글은 볼 수 없어요."}
          </Text>
        </View>
      </Screen>
    );
  }

  if (detail.isPending) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen>
        <ErrorState message="나눔 정보를 다시 불러와주세요." />
      </Screen>
    );
  }

  const market = detail.data;
  const isOwn = variant
    ? !variant.startsWith("other") && !isReportVariant
    : market.isMine;
  const status =
    variant === "own-reserved"
      ? "reserved"
      : variant === "own-done"
        ? "done"
        : market.status;
  const isReserved = status === "reserved";
  const isDone = status === "done";
  const authorName =
    variant?.startsWith("other") || isReportVariant
      ? "박정아"
      : market.authorName;
  const isCommentPending = createComment.isPending || updateComment.isPending;
  const resetCommentComposer = () => {
    setComment("");
    setEditingCommentId(null);
  };
  const onSubmitComment = () => {
    if (!comment.trim()) return;
    if (editingCommentId) {
      updateComment.mutate(
        { commentId: editingCommentId, content: comment },
        { onSuccess: resetCommentComposer },
      );
      return;
    }
    createComment.mutate(comment, { onSuccess: resetCommentComposer });
  };
  const onEditComment = (target: MarketDetailComment) => {
    setEditingCommentId(target.id);
    setComment(target.content ?? "");
  };
  const onDeleteComment = (target: MarketDetailComment) => {
    Alert.alert("댓글 삭제", "삭제한 댓글은 복구할 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteComment.mutate(target.id, {
            onSuccess: () => {
              if (editingCommentId === target.id) resetCommentComposer();
            },
          });
        },
      },
    ]);
  };
  const onDeletePost = () => {
    setShowDelete(true);
  };
  const onConfirmDeletePost = () => {
    deletePost.mutate(undefined, {
      onSuccess: () => {
        setShowDelete(false);
        router.replace("/market");
      },
    });
  };
  const openReport = (target: ReportTarget) => {
    setReportTarget(target);
    setReportReason("false_information");
    setReportDetails("");
    setReportMessage(undefined);
  };
  const closeReport = () => setReportTarget(null);
  const onSubmitReport = () => {
    if (!reportTarget) return;
    reportContent.mutate(
      {
        ...reportTarget,
        reason: reportReason,
        content: reportDetails || undefined,
      },
      {
        onSuccess: () => {
          closeReport();
          setReportMessage("신고가 접수되었습니다");
        },
        onError: (error) => {
          if (error instanceof DuplicateMarketReportError) {
            closeReport();
            setReportMessage("이미 신고한 콘텐츠입니다");
            return;
          }
          setReportMessage("신고 처리에 실패했습니다");
        },
      },
    );
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.hero, { height: width }]}>
            <VisualThumb
              size={width}
              seed={market.thumbSeed}
              style={styles.heroThumb}
            />
            <View style={styles.heroScrim} />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialIcons
                name="chevron-left"
                size={22}
                color={theme.colors.ink}
              />
              <Text style={styles.backText}>뒤로</Text>
            </Pressable>
            {isReserved ? <CenterBadge label="예약중" /> : null}
            {isDone ? (
              <>
                <View style={styles.doneOverlay} />
                <Text style={styles.doneHeroText}>나눔완료</Text>
              </>
            ) : null}
            <View style={styles.dots}>
              <View style={styles.dotOn} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          {isReserved ? (
            <StatusBanner
              icon="schedule"
              title="예약중인 나눔입니다"
              text="다른 분과 수령 약속이 진행 중이에요"
              warn
            />
          ) : null}
          {isDone ? (
            <StatusBanner
              icon="check"
              title="나눔이 완료되었습니다"
              text="이 게시글은 더 이상 신청할 수 없어요"
            />
          ) : null}

          <View style={isDone ? styles.doneContent : null}>
            <View style={styles.authorRow}>
              <Avatar name={authorName} size={40} />
              <View style={styles.authorText}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.meta}>{market.createdLabel}</Text>
              </View>
            </View>

            <View style={styles.article}>
              <View style={styles.chips}>
                <View style={styles.softChip}>
                  <Text style={styles.softChipText}>
                    {market.categoryLabel}
                  </Text>
                </View>
                <View style={styles.conditionChip}>
                  <Text style={styles.conditionText}>
                    {market.conditionLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{market.title}</Text>
              <Text style={styles.body}>{market.content}</Text>
            </View>

            <View style={styles.actions}>
              {isOwn && !isDone ? (
                <>
                  <Action icon="edit" label="수정" />
                  <Action
                    testID="market-delete-post"
                    icon="delete-outline"
                    label="삭제"
                    danger
                    onPress={onDeletePost}
                  />
                  <Action icon="sync-alt" label="상태 변경" />
                </>
              ) : isOwn ? (
                <Action
                  testID="market-delete-post"
                  icon="delete-outline"
                  label="삭제"
                  danger
                  onPress={onDeletePost}
                />
              ) : (
                <>
                  <Action
                    testID="market-report-post"
                    icon="outlined-flag"
                    label="신고"
                    onPress={() =>
                      openReport({ targetType: "market", targetId: market.id })
                    }
                  />
                  <Action icon="block" label="차단" danger />
                </>
              )}
            </View>

            <CommentsSection
              comments={market.comments}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              onReport={(target) =>
                openReport({ targetType: "comment", targetId: target.id })
              }
            />
          </View>
        </ScrollView>

        <View style={styles.composer}>
          {editingCommentId ? (
            <Pressable
              accessibilityRole="button"
              onPress={resetCommentComposer}
              style={styles.cancelEdit}
            >
              <Text style={styles.cancelEditText}>수정 취소</Text>
            </Pressable>
          ) : null}
          <TextInput
            testID="market-comment-input"
            value={comment}
            onChangeText={setComment}
            editable={!isCommentPending}
            placeholder={
              editingCommentId ? "댓글을 수정해주세요" : "댓글을 입력해주세요"
            }
            placeholderTextColor={theme.colors.inkMute}
            style={styles.commentInput}
          />
          <Pressable
            testID="market-comment-submit"
            accessibilityRole="button"
            accessibilityLabel={editingCommentId ? "댓글 수정" : "댓글 등록"}
            onPress={onSubmitComment}
            disabled={!comment.trim() || isCommentPending}
            style={styles.sendButton}
          >
            {isCommentPending ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <MaterialIcons name="send" size={18} color={theme.colors.white} />
            )}
          </Pressable>
        </View>
        {createComment.isError ||
        updateComment.isError ||
        deleteComment.isError ? (
          <Text style={styles.commentError}>댓글 처리에 실패했습니다.</Text>
        ) : null}
        <RadioSheet
          visible={Boolean(reportTarget)}
          title="신고"
          options={reportReasonOptions}
          value={reportReason}
          confirmText="신고하기"
          danger
          hint="허위·악의적 신고 시 이용이 제한될 수 있습니다."
          confirmDisabled={
            reportContent.isPending ||
            (reportReason === "other" && !reportDetails.trim())
          }
          onValueChange={(value) =>
            setReportReason(value as MarketReportReason)
          }
          onClose={closeReport}
          onConfirm={onSubmitReport}
        >
          {reportReason === "other" ? (
            <TextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="신고 사유를 자세히 입력해주세요"
              placeholderTextColor={theme.colors.inkMute}
              multiline
              style={styles.reportInput}
              textAlignVertical="top"
            />
          ) : null}
        </RadioSheet>
        <ConfirmDialog
          visible={showDelete}
          title="게시글을 삭제하시겠습니까?"
          message="삭제하면 댓글을 포함한 모든 내용이 사라지며 복구할 수 없어요."
          confirmText="삭제"
          danger
          onCancel={() => setShowDelete(false)}
          onConfirm={onConfirmDeletePost}
        />
        <Toast message={reportMessage} offset={106} />
      </View>
    </Screen>
  );
}

function CenterBadge({ label }: { label: string }) {
  return (
    <View style={styles.centerBadge}>
      <Text style={styles.centerBadgeText}>{label}</Text>
    </View>
  );
}

function StatusBanner({
  icon,
  title,
  text,
  warn = false,
}: {
  icon: "check" | "schedule";
  title: string;
  text: string;
  warn?: boolean;
}) {
  return (
    <View style={[styles.banner, warn ? styles.bannerWarn : null]}>
      <View style={[styles.bannerIcon, warn ? styles.bannerIconWarn : null]}>
        <MaterialIcons name={icon} size={16} color={theme.colors.white} />
      </View>
      <View style={styles.bannerTextWrap}>
        <Text
          style={[styles.bannerTitle, warn ? styles.bannerTitleWarn : null]}
        >
          {title}
        </Text>
        <Text style={[styles.bannerText, warn ? styles.bannerTextWarn : null]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  danger = false,
  onPress,
  testID,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const color = danger ? theme.colors.danger : theme.colors.ink;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.action}
    >
      <MaterialIcons name={icon} size={18} color={color} />
      <Text style={[styles.actionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CommentsSection({
  comments,
  onEdit,
  onDelete,
  onReport,
}: {
  comments: MarketDetailComment[];
  onEdit: (comment: MarketDetailComment) => void;
  onDelete: (comment: MarketDetailComment) => void;
  onReport: (comment: MarketDetailComment) => void;
}) {
  const activeCount = comments.filter((comment) => !comment.isDeleted).length;

  return (
    <View style={styles.comments}>
      <Text style={styles.commentCount}>댓글 {activeCount}개</Text>
      {comments.map((comment, index) => (
        <View
          key={comment.id}
          style={[
            styles.commentRow,
            index === comments.length - 1 ? styles.commentRowLast : null,
          ]}
        >
          <Avatar name={comment.authorName} size={32} />
          <View style={styles.commentBody}>
            <View style={styles.commentMeta}>
              <Text style={styles.commentAuthor}>{comment.authorName}</Text>
              <Text style={styles.commentWhen}>{comment.createdLabel}</Text>
              {comment.isEdited ? (
                <Text style={styles.commentWhen}>· 수정됨</Text>
              ) : null}
            </View>
            {comment.isDeleted ? (
              <Text style={styles.deletedComment}>삭제된 댓글입니다</Text>
            ) : (
              <>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  {comment.isMine ? (
                    <>
                      <MiniAction
                        testID={`market-comment-edit-${comment.id}`}
                        accessibilityLabel={`댓글 수정 ${comment.content}`}
                        icon="edit"
                        label="수정"
                        onPress={() => onEdit(comment)}
                      />
                      <MiniAction
                        testID={`market-comment-delete-${comment.id}`}
                        accessibilityLabel={`댓글 삭제 ${comment.content}`}
                        icon="delete-outline"
                        label="삭제"
                        danger
                        onPress={() => onDelete(comment)}
                      />
                    </>
                  ) : (
                    <MiniAction
                      testID={`market-comment-report-${comment.id}`}
                      icon="outlined-flag"
                      label="신고"
                      onPress={() => onReport(comment)}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function MiniAction({
  icon,
  label,
  danger = false,
  onPress,
  testID,
  accessibilityLabel,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={styles.miniAction}
    >
      <MaterialIcons
        name={icon}
        size={14}
        color={danger ? theme.colors.danger : theme.colors.inkMute}
      />
      <Text style={[styles.miniActionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingBottom: 96 },
  hero: {
    position: "relative",
    backgroundColor: "#E2DED3",
  },
  heroThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  heroScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: "rgba(20,30,18,0.24)",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    minHeight: 36,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    ...theme.shadow.card,
  },
  backText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,30,18,0.45)",
  },
  doneHeroText: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    color: theme.colors.white,
    fontSize: 34,
    fontWeight: theme.fontWeight.extrabold,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dotOn: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  centerBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    borderRadius: theme.radius.sm,
    backgroundColor: "#E89A3C",
    paddingHorizontal: 22,
    paddingVertical: 10,
    ...theme.shadow.raised,
  },
  centerBadgeText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: theme.fontWeight.extrabold,
  },
  banner: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bannerWarn: {
    borderWidth: 1,
    borderColor: "rgba(232,154,60,0.32)",
    backgroundColor: "rgba(232,154,60,0.12)",
  },
  bannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.85)",
  },
  bannerIconWarn: {
    backgroundColor: "#E89A3C",
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.bold,
  },
  bannerTitleWarn: {
    color: "#8A5A1F",
  },
  bannerText: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  bannerTextWarn: {
    color: "#A87B3A",
  },
  doneContent: {
    opacity: 0.6,
  },
  authorRow: {
    paddingTop: 16,
    paddingHorizontal: 22,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorText: { flex: 1 },
  authorName: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  meta: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  article: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 22,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  softChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  softChipText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  conditionChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(143,168,130,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionText: {
    color: "#4F6B45",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: theme.fontWeight.bold,
  },
  body: {
    marginTop: 16,
    color: theme.colors.inkSoft,
    fontSize: 14.5,
    lineHeight: 25,
  },
  actions: {
    marginHorizontal: 16,
    marginBottom: 22,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: 4,
    flexDirection: "row",
    ...theme.shadow.card,
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.semibold,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  comments: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 12,
  },
  commentCount: {
    paddingVertical: 8,
    color: theme.colors.inkMute,
    fontSize: 13,
    fontWeight: theme.fontWeight.bold,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: 12,
  },
  commentRowLast: {
    borderBottomWidth: 0,
  },
  commentBody: { flex: 1, minWidth: 0 },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.bold,
  },
  commentWhen: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
  },
  deletedComment: {
    marginTop: 4,
    color: theme.colors.inkHint,
    fontSize: 13.5,
    fontStyle: "italic",
  },
  commentText: {
    marginTop: 4,
    color: theme.colors.ink,
    fontSize: 13.5,
    lineHeight: 20,
  },
  commentActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 12,
  },
  miniAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniActionText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.glass,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  cancelEdit: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelEditText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  commentError: {
    position: "absolute",
    right: 18,
    bottom: 72,
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(20,30,18,0.05)",
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  reportInput: {
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.md,
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  exception: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 120,
  },
  exceptionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  exceptionText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.md,
    textAlign: "center",
  },
});
