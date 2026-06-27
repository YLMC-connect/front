import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Avatar, VisualThumb } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

type CommentItem = {
  author: string;
  when: string;
  text?: string;
  self?: boolean;
  edited?: boolean;
  deleted?: boolean;
};

const comments: CommentItem[] = [
  {
    author: "이수진",
    when: "30분 전",
    text: "필요해요! 토요일에 들를게요. 연락드릴게요 :)",
    self: false,
  },
  {
    author: "김지영",
    when: "25분 전",
    text: "좋은 나눔 감사해요. 저도 비슷한 시기에 정리했는데 도움이 많이 됐어요!",
    self: false,
    edited: true,
  },
  {
    author: "정혜진",
    when: "20분 전",
    deleted: true,
  },
  {
    author: "한유라",
    when: "10분 전",
    text: "아직 남아있을까요? 늦었지만 가능하면 부탁드려요.",
    self: true,
  },
] as const;

export default function MarketDetailScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = Array.isArray(params.variant)
    ? params.variant[0]
    : (params.variant ?? "own");
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isOwn = !variant.startsWith("other");
  const isReserved = variant === "own-reserved";
  const isDone = variant === "own-done";

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

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.hero, { height: width }]}>
            <VisualThumb size={width} seed={0} style={styles.heroThumb} />
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
              <Avatar name={isOwn ? "김은혜" : "박정아"} size={40} />
              <View style={styles.authorText}>
                <Text style={styles.authorName}>
                  {isOwn ? "김은혜" : "박정아"}
                </Text>
                <Text style={styles.meta}>1시간 전</Text>
              </View>
            </View>

            <View style={styles.article}>
              <View style={styles.chips}>
                <View style={styles.softChip}>
                  <Text style={styles.softChipText}>유아·아동용품</Text>
                </View>
                <View style={styles.conditionChip}>
                  <Text style={styles.conditionText}>사용감 있음</Text>
                </View>
              </View>
              <Text style={styles.title}>
                아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)
              </Text>
              <Text style={styles.body}>
                아이가 커서 더 이상 쓰지 않는 장난감 정리해요. 대부분 깨끗하게
                사용한 것들이고, 블록류 20점 + 인형류 10점 정도 됩니다. 필요하신
                분께 무료로 드려요!{"\n\n"}수령은 토요일 오후 교회 1층 로비에서
                가능합니다. 한 분께 일괄로 드리려고 합니다.
              </Text>
            </View>

            <View style={styles.actions}>
              {isOwn && !isDone ? (
                <>
                  <Action icon="edit" label="수정" />
                  <Action icon="delete-outline" label="삭제" danger />
                  <Action icon="sync-alt" label="상태 변경" />
                </>
              ) : isOwn ? (
                <Action icon="delete-outline" label="삭제" danger />
              ) : (
                <>
                  <Action icon="outlined-flag" label="신고" />
                  <Action icon="block" label="차단" danger />
                </>
              )}
            </View>

            <CommentsSection />
          </View>
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            editable={false}
            placeholder="댓글을 입력해주세요"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.commentInput}
          />
          <Pressable accessibilityRole="button" style={styles.sendButton}>
            <MaterialIcons name="send" size={18} color={theme.colors.white} />
          </Pressable>
        </View>
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
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
}) {
  const color = danger ? theme.colors.danger : theme.colors.ink;

  return (
    <Pressable accessibilityRole="button" style={styles.action}>
      <MaterialIcons name={icon} size={18} color={color} />
      <Text style={[styles.actionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CommentsSection() {
  const activeCount = comments.filter((comment) => !comment.deleted).length;

  return (
    <View style={styles.comments}>
      <Text style={styles.commentCount}>댓글 {activeCount}개</Text>
      {comments.map((comment, index) => (
        <View
          key={`${comment.author}-${comment.when}`}
          style={[
            styles.commentRow,
            index === comments.length - 1 ? styles.commentRowLast : null,
          ]}
        >
          <Avatar name={comment.author} size={32} />
          <View style={styles.commentBody}>
            <View style={styles.commentMeta}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentWhen}>{comment.when}</Text>
              {comment.edited ? (
                <Text style={styles.commentWhen}>· 수정됨</Text>
              ) : null}
            </View>
            {comment.deleted ? (
              <Text style={styles.deletedComment}>삭제된 댓글입니다</Text>
            ) : (
              <>
                <Text style={styles.commentText}>{comment.text}</Text>
                <View style={styles.commentActions}>
                  {comment.self ? (
                    <>
                      <MiniAction icon="edit" label="수정" />
                      <MiniAction icon="delete-outline" label="삭제" danger />
                    </>
                  ) : (
                    <MiniAction icon="outlined-flag" label="신고" />
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
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.miniAction}>
      <MaterialIcons
        name={icon}
        size={14}
        color={danger ? theme.colors.danger : theme.colors.inkMute}
      />
      <Text style={[styles.miniActionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  commentInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(20,30,18,0.05)",
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
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
