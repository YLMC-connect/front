import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Avatar, Card, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

const members = ["김은혜", "박정아", "이수진", "김지영", "정혜진", "조미경"];

const notices = [
  {
    title: "5월 18일 토요일 모임 안내",
    preview:
      "이번 주 토요일은 북한산 도선사 코스로 갑니다. 오전 7시 교회 앞에서 모입니다.",
    when: "2일 전",
  },
  {
    title: "신규 멤버 환영합니다",
    preview:
      "이번 달에 새로 합류해주신 분들 진심으로 환영해요. 다음 모임 때 소개 시간이 있을 예정입니다.",
    when: "1주 전",
    edited: true,
  },
];

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "leader";
  const isDeleted = variant === "deleted-exception";
  const isLeader = variant === "leader" || variant === "leader-closed";
  const isMember = variant === "member" || variant === "leave-confirm";
  const isNonMember = variant === "non-member" || variant === "non-closed";
  const isClosed = variant === "leader-closed" || variant === "non-closed";
  const current = isClosed ? 25 : 18;

  if (isDeleted) {
    return (
      <Screen>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <View style={styles.exception}>
          <MaterialIcons
            name="error-outline"
            size={42}
            color={theme.colors.inkHint}
          />
          <Text style={styles.exceptionTitle}>존재하지 않는 소모임입니다</Text>
          <Text style={styles.exceptionText}>
            삭제되었거나 더 이상 접근할 수 없는 소모임이에요.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <View style={styles.chips}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>운동·건강</Text>
              </View>
              <View
                style={[
                  styles.recruitChip,
                  isClosed ? styles.recruitChipClosed : null,
                ]}
              >
                <Text
                  style={[
                    styles.recruitText,
                    isClosed ? styles.recruitTextClosed : null,
                  ]}
                >
                  {isClosed ? "모집완료" : "모집중"}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>토요 산악회</Text>

            <View style={styles.memberMeta}>
              <MaterialIcons
                name="groups"
                size={15}
                color={theme.colors.inkSoft}
              />
              <Text style={styles.memberMetaText}>
                현재 <Text style={styles.memberCount}>{current}</Text> / 최대 25
              </Text>
            </View>

            <Text style={styles.description}>
              매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는
              모임입니다.{"\n"}등산 초보도 환영해요. 등산화·물·간식만 챙겨오시면
              돼요.{"\n"}모임 일정과 코스는 매주 화요일 공지로 안내드립니다.
            </Text>

            <View style={styles.leaderCard}>
              <Avatar name={isLeader ? "김은혜" : "한지수"} size={36} />
              <View style={styles.leaderText}>
                <Text style={styles.leaderLabel}>소모임장</Text>
                <Text style={styles.leaderName}>
                  {isLeader ? "김은혜" : "한지수"}
                </Text>
              </View>
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderBadgeText}>소모임장</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionWrap}>
            {isLeader ? (
              <Card style={styles.actionCard}>
                <Action icon="edit" label="수정" />
                <Action icon="campaign" label="공지" />
                <Action icon="groups" label="멤버" />
                <Action icon="delete-outline" label="삭제" danger />
              </Card>
            ) : isMember ? (
              <Pressable
                accessibilityRole="button"
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>탈퇴하기</Text>
              </Pressable>
            ) : isNonMember ? (
              <Pressable
                accessibilityRole="button"
                disabled={isClosed}
                style={[
                  styles.primaryButton,
                  isClosed ? styles.primaryButtonOff : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isClosed ? "모집이 마감됐어요" : "참여 신청하기"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <SectionTitle title={`멤버 ${members.length}명`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberRail}
          >
            {members.map((name, index) => (
              <View key={name} style={styles.memberItem}>
                <View>
                  <Avatar name={name} size={48} />
                  {index === 0 ? (
                    <View style={styles.crown}>
                      <MaterialIcons
                        name="star"
                        size={10}
                        color={theme.colors.white}
                      />
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={styles.memberName}>
                  {name}
                </Text>
              </View>
            ))}
          </ScrollView>

          <SectionTitle title="공지사항" />
          <View style={styles.noticeList}>
            {notices.map((notice) => (
              <Card key={notice.title} style={styles.noticeCard}>
                <View style={styles.noticeTitleRow}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  {notice.edited ? (
                    <Text style={styles.editedText}>수정됨</Text>
                  ) : null}
                </View>
                <Text numberOfLines={2} style={styles.noticePreview}>
                  {notice.preview}
                </Text>
                <Text style={styles.noticeWhen}>{notice.when}</Text>
                {isLeader ? (
                  <View style={styles.noticeActions}>
                    <MiniAction icon="edit" label="수정" />
                    <MiniAction icon="delete-outline" label="삭제" danger />
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
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
  return (
    <Pressable accessibilityRole="button" style={styles.action}>
      <MaterialIcons
        name={icon}
        size={18}
        color={danger ? theme.colors.danger : theme.colors.ink}
      />
      <Text style={[styles.actionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </Pressable>
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

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 18,
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: theme.colors.primaryDeep,
    fontSize: 11.5,
    fontWeight: theme.fontWeight.semibold,
  },
  recruitChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.sageSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recruitChipClosed: {
    backgroundColor: theme.colors.surface2,
  },
  recruitText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  recruitTextClosed: {
    color: theme.colors.inkMute,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: theme.fontWeight.extrabold,
  },
  memberMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberMetaText: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.semibold,
  },
  memberCount: {
    color: theme.colors.primaryDeep,
  },
  description: {
    marginTop: 14,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 22,
  },
  leaderCard: {
    marginTop: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leaderText: { flex: 1 },
  leaderLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  leaderName: {
    marginTop: 2,
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.bold,
  },
  leaderBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  leaderBadgeText: {
    color: theme.colors.white,
    fontSize: 10.5,
    fontWeight: theme.fontWeight.bold,
  },
  actionWrap: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  actionCard: {
    flexDirection: "row",
    padding: 4,
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  outlineButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  primaryButtonOff: {
    backgroundColor: theme.colors.lineStrong,
    opacity: 0.6,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  sectionTitleWrap: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  memberRail: {
    gap: 16,
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  memberItem: {
    width: 56,
    alignItems: "center",
    gap: 6,
  },
  crown: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.bg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    maxWidth: 56,
    color: theme.colors.inkSoft,
    fontSize: 11.5,
    fontWeight: theme.fontWeight.semibold,
    textAlign: "center",
  },
  noticeList: {
    gap: 10,
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  noticeCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noticeTitle: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.bold,
  },
  editedText: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
  },
  noticePreview: {
    marginTop: 6,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  noticeWhen: {
    marginTop: 8,
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
  },
  noticeActions: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    paddingTop: 10,
    flexDirection: "row",
    gap: 14,
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
