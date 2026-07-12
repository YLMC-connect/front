import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Card,
  ConfirmDialog,
  DetailAction,
  DetailMiniAction,
  ErrorState,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useDeleteGroupNotice,
  useGroupDetail,
} from "../../../src/hooks/useGroups";
import { readDesignVariant } from "../../../src/lib/designVariant";

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const id = params.id ?? "1";
  const variant = readDesignVariant(params.designVariant);
  const detail = useGroupDetail(id);
  const deleteNotice = useDeleteGroupNotice(id);
  const [deletingNotice, setDeletingNotice] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const isDeleted = variant === "deleted-exception";

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
        <ErrorState message="소모임 정보를 다시 불러와주세요." />
      </Screen>
    );
  }

  const group = detail.data;
  const isLeader = variant
    ? variant === "leader" || variant === "leader-closed"
    : group.isLeader;
  const isMember = variant
    ? variant === "member" || variant === "leave-confirm"
    : group.isJoined && !group.isLeader;
  const isNonMember = variant
    ? variant === "non-member" || variant === "non-closed"
    : !group.isJoined;
  const isClosed = variant
    ? variant === "leader-closed" || variant === "non-closed"
    : group.status === "closed";
  const current = isClosed ? group.maxMembers : group.currentMembers;
  const leaderName = variant && !isLeader ? "한지수" : group.leaderName;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <View style={styles.chips}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{group.categoryLabel}</Text>
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

            <Text style={styles.title}>{group.name}</Text>

            <View style={styles.memberMeta}>
              <MaterialIcons
                name="groups"
                size={15}
                color={theme.colors.inkSoft}
              />
              <Text style={styles.memberMetaText}>
                현재 <Text style={styles.memberCount}>{current}</Text> / 최대{" "}
                {group.maxMembers}
              </Text>
            </View>

            <Text style={styles.description}>{group.description}</Text>

            <View style={styles.leaderCard}>
              <Avatar name={leaderName} size={36} />
              <View style={styles.leaderText}>
                <Text style={styles.leaderLabel}>소모임장</Text>
                <Text style={styles.leaderName}>{leaderName}</Text>
              </View>
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderBadgeText}>소모임장</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionWrap}>
            {isLeader ? (
              <Card style={styles.actionCard}>
                <DetailAction icon="edit" label="수정" />
                <DetailAction
                  testID="group-notice-open-create"
                  icon="campaign"
                  label="공지"
                  onPress={() => router.push(`/group/notices?id=${id}`)}
                />
                <DetailAction
                  icon="groups"
                  label="멤버"
                  onPress={() => router.push(`/group/members?id=${id}`)}
                />
                <DetailAction icon="delete-outline" label="삭제" danger />
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

          <SectionTitle title={`멤버 ${group.members.length}명`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberRail}
          >
            {group.members.map((name, index) => (
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
            {group.notices.map((notice) => (
              <Card key={notice.id} style={styles.noticeCard}>
                <View style={styles.noticeTitleRow}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  {notice.isEdited ? (
                    <Text style={styles.editedText}>수정됨</Text>
                  ) : null}
                </View>
                <Text numberOfLines={2} style={styles.noticePreview}>
                  {notice.preview}
                </Text>
                <Text style={styles.noticeWhen}>{notice.createdLabel}</Text>
                {isLeader ? (
                  <View style={styles.noticeActions}>
                    <DetailMiniAction
                      testID={`group-notice-edit-${notice.id}`}
                      icon="edit"
                      label="수정"
                      onPress={() =>
                        router.push(
                          `/group/notices?id=${id}&noticeId=${notice.id}`,
                        )
                      }
                    />
                    <DetailMiniAction
                      testID={`group-notice-delete-${notice.id}`}
                      icon="delete-outline"
                      label="삭제"
                      danger
                      onPress={() =>
                        setDeletingNotice({
                          id: notice.id,
                          title: notice.title,
                        })
                      }
                    />
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        </ScrollView>
        {deleteNotice.isError ? (
          <Text style={styles.noticeError}>공지 삭제에 실패했습니다.</Text>
        ) : null}
        <ConfirmDialog
          visible={Boolean(deletingNotice)}
          title="공지를 삭제하시겠습니까?"
          message={
            deletingNotice
              ? `“${deletingNotice.title}” 공지는 삭제 후 복구할 수 없어요.`
              : ""
          }
          confirmText="삭제"
          danger
          onCancel={() => setDeletingNotice(null)}
          onConfirm={() => {
            if (!deletingNotice || deleteNotice.isPending) return;
            deleteNotice.mutate(deletingNotice.id, {
              onSuccess: () => setDeletingNotice(null),
              onError: () => setDeletingNotice(null),
            });
          }}
        />
      </View>
    </Screen>
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeError: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
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
