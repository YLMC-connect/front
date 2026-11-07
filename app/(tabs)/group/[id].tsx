import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  AppText,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DetailAction,
  DetailMiniAction,
  ErrorState,
  Skeleton,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useDeleteGroup,
  useDeleteGroupNotice,
  useGroupDetail,
  useJoinGroup,
  useLeaveGroup,
  useUpdateGroupStatus,
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
  const deleteGroupMutation = useDeleteGroup(id);
  const updateStatusMutation = useUpdateGroupStatus(id);
  const joinGroupMutation = useJoinGroup(id);
  const leaveGroupMutation = useLeaveGroup(id);
  const [deletingNotice, setDeletingNotice] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDeleted = variant === "deleted-exception";
  const membershipBusy =
    joinGroupMutation.isPending || leaveGroupMutation.isPending;
  const membershipError = joinGroupMutation.isError
    ? joinGroupMutation.error
    : leaveGroupMutation.isError
      ? leaveGroupMutation.error
      : null;

  if (isDeleted) {
    return (
      <Screen>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <View style={styles.exception}>
          <AppIcon
            name="error-outline"
            size={42}
            color={theme.colors.textMuted}
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
          <Skeleton width="100%" height={220} radius={0} />
          <View style={styles.loadingBody}>
            <Skeleton width="70%" height={26} />
            <Skeleton width="100%" height={76} />
          </View>
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen>
        <ErrorState
          message="소모임 정보를 다시 불러와주세요."
          onRetry={() => detail.refetch()}
        />
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
  const current = group.currentMembers;
  const leaderName = variant && !isLeader ? "한지수" : group.leaderName;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={detail.isRefetching}
              onRefresh={() => void detail.refetch()}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.chips}>
              <Badge tone="neutral">{group.categoryLabel}</Badge>
              {isLeader ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`모집 상태 변경: 현재 ${isClosed ? "모집완료" : "모집중"}`}
                  disabled={updateStatusMutation.isPending}
                  hitSlop={{ top: 9, bottom: 9 }}
                  onPress={() => {
                    updateStatusMutation.mutate(isClosed ? "open" : "closed");
                  }}
                >
                  <Badge tone={isClosed ? "neutral" : "info"}>
                    {isClosed ? "모집완료" : "모집중"}
                  </Badge>
                </Pressable>
              ) : (
                <Badge tone={isClosed ? "neutral" : "info"}>
                  {isClosed ? "모집완료" : "모집중"}
                </Badge>
              )}
            </View>

            <AppText variant="title">{group.name}</AppText>

            <View style={styles.memberMeta}>
              <AppIcon name="groups" size={15} color={theme.colors.text} />
              <Text style={styles.memberMetaText}>
                현재 <Text style={styles.memberCount}>{current}</Text> / 최대{" "}
                {group.maxMembers}
              </Text>
            </View>

            <AppText variant="body" tone="primary" style={styles.description}>
              {group.description}
            </AppText>

            <View style={styles.leaderCard}>
              <Avatar name={leaderName} size={36} />
              <View style={styles.leaderText}>
                <Text style={styles.leaderLabel}>소모임장</Text>
                <Text style={styles.leaderName}>{leaderName}</Text>
              </View>
              <Badge tone="info">소모임장</Badge>
            </View>
          </View>

          <View style={styles.actionWrap}>
            {isLeader ? (
              <Card style={styles.actionCard}>
                <DetailAction
                  icon="edit"
                  label="수정"
                  onPress={() => router.push(`/modal/group-new?id=${id}`)}
                />
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
                <DetailAction
                  testID="group-transfer-open"
                  icon="sync-alt"
                  label="이관"
                  onPress={() =>
                    router.push(`/group/members?id=${id}&mode=transfer`)
                  }
                />
                <DetailAction
                  icon="delete-outline"
                  label="삭제"
                  danger
                  onPress={() => setShowDeleteConfirm(true)}
                />
              </Card>
            ) : isMember ? (
              <Button
                testID="group-leave-button"
                variant="outline"
                size="lg"
                accessibilityLabel="탈퇴하기"
                disabled={membershipBusy}
                onPress={() => {
                  if (variant) return;
                  setShowLeaveConfirm(true);
                }}
              >
                탈퇴하기
              </Button>
            ) : isNonMember ? (
              <Button
                testID="group-join-button"
                size="lg"
                accessibilityLabel={
                  isClosed ? "모집이 마감됐어요" : "참여 신청하기"
                }
                disabled={isClosed}
                loading={membershipBusy}
                onPress={() => {
                  if (variant || isClosed) return;
                  joinGroupMutation.mutate();
                }}
              >
                {isClosed ? "모집이 마감됐어요" : "참여 신청하기"}
              </Button>
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
                  {index === 0 && name === group.leaderName ? (
                    <View style={styles.crown}>
                      <AppIcon
                        name="star"
                        size={10}
                        color={theme.colors.onPrimary}
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
                      accessibilityLabel={`${notice.title} 공지 수정`}
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
                      accessibilityLabel={`${notice.title} 공지 삭제`}
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
        {membershipError ? (
          <Text style={styles.noticeError}>
            {membershipError instanceof Error
              ? membershipError.message
              : "소모임 참여 상태를 바꾸지 못했습니다."}
          </Text>
        ) : null}
        <ConfirmDialog
          visible={showLeaveConfirm}
          title="소모임을 탈퇴할까요?"
          message="탈퇴하면 공지와 일정을 더 이상 받아볼 수 없어요."
          confirmText="탈퇴"
          danger
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={() => {
            if (leaveGroupMutation.isPending) return;
            leaveGroupMutation.mutate(undefined, {
              onSettled: () => setShowLeaveConfirm(false),
            });
          }}
        />
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
        <ConfirmDialog
          visible={showDeleteConfirm}
          title="소모임을 삭제하시겠습니까?"
          message="삭제된 소모임은 복구할 수 없습니다."
          confirmText="삭제"
          danger
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            if (deleteGroupMutation.isPending) return;
            try {
              await deleteGroupMutation.mutateAsync();
              setShowDeleteConfirm(false);
              router.replace("/(tabs)/group");
            } catch {
              // 실패 안내는 아래 deleteGroupMutation.isError 문구가 맡는다. 확인 창만 닫는다.
              setShowDeleteConfirm(false);
            }
          }}
        />
        {deleteGroupMutation.isError ? (
          <Text style={styles.noticeError}>소모임 삭제에 실패했습니다.</Text>
        ) : null}
        {updateStatusMutation.isError ? (
          <Text style={styles.noticeError}>
            소모임 모집 상태를 변경하지 못했습니다.
          </Text>
        ) : null}
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
  },
  loadingBody: {
    padding: theme.layout.screenX,
    gap: theme.layout.listGap,
  },
  noticeError: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
  },
  body: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[5],
    paddingBottom: 18,
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  memberMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberMetaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  memberCount: {
    color: theme.colors.primaryStrong,
  },
  description: {
    marginTop: 14,
  },
  leaderCard: {
    marginTop: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leaderText: { flex: 1 },
  leaderLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  leaderName: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
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
  sectionTitleWrap: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
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
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
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
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  editedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  noticePreview: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  noticeWhen: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  noticeActions: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  exceptionText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    textAlign: "center",
  },
});
