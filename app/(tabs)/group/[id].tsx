import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
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
  FLOATING_BOTTOM_BAR_INSET,
  FloatingBottomBar,
  MotionPressable,
  Skeleton,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  groupStatusLabel,
  groupStatusTone,
} from "../../../src/services/groupMapper";
import {
  useCancelGroupApplication,
  useDeleteGroup,
  useDeleteGroupNotice,
  useGroupDetail,
  useJoinGroup,
  useLeaveGroup,
  useUpdateGroupStatus,
} from "../../../src/hooks/useGroups";

/** 멤버 줄에 아바타를 몇 명까지 보이고 나머지는 "+N 더보기" 로 묶을지. */
const MEMBER_PREVIEW_LIMIT = 4;

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? "1";
  const detail = useGroupDetail(id);
  const deleteNotice = useDeleteGroupNotice(id);
  const deleteGroupMutation = useDeleteGroup(id);
  const updateStatusMutation = useUpdateGroupStatus(id);
  const joinGroupMutation = useJoinGroup(id);
  const leaveGroupMutation = useLeaveGroup(id);
  const cancelApplicationMutation = useCancelGroupApplication(id);
  const [deletingNotice, setDeletingNotice] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelApplyConfirm, setShowCancelApplyConfirm] = useState(false);
  const membershipBusy =
    joinGroupMutation.isPending ||
    leaveGroupMutation.isPending ||
    cancelApplicationMutation.isPending;
  const membershipError = joinGroupMutation.isError
    ? joinGroupMutation.error
    : leaveGroupMutation.isError
      ? leaveGroupMutation.error
      : cancelApplicationMutation.isError
        ? cancelApplicationMutation.error
        : null;
  if (detail.isPending) {
    return (
      <Screen padded={false}>
        <TopBar title="소모임" back onBack={() => router.back()} />
        <View style={styles.loading}>
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
          message="소모임 정보를 다시 불러와 주세요."
          onRetry={() => detail.refetch()}
        />
      </Screen>
    );
  }

  const group = detail.data;
  const isLeader = group.isLeader;
  const isMember = group.isJoined && !group.isLeader;
  const isNonMember = !group.isJoined;
  // 내 가입 신청 상태는 서버(myMemberStatus)가 알려 준다. 화면을 다시 열어도 유지된다
  const isApplicationPending = group.myApplicationStatus === "pending";
  const isApplicationRejected = group.myApplicationStatus === "rejected";
  const isClosed = group.status === "closed";
  // 승인대기·반려 모임은 참여와 모집 상태 변경을 막는다
  const isApproved = group.status === "open" || group.status === "closed";
  const joinBlockedLabel =
    group.status === "pending"
      ? "승인 대기 중인 모임이에요"
      : group.status === "rejected"
        ? "반려된 모임이에요"
        : isClosed
          ? "모집이 마감됐어요"
          : null;
  const joinLabel =
    joinBlockedLabel ??
    (isApplicationRejected
      ? "다시 신청하기"
      : group.requiresApproval
        ? "가입 신청하기"
        : "참여 신청하기");
  const current = group.currentMembers;
  const leaderName = group.leaderName;
  const visibleMembers =
    group.members.length > MEMBER_PREVIEW_LIMIT + 1
      ? group.members.slice(0, MEMBER_PREVIEW_LIMIT)
      : group.members;
  const hiddenMemberCount = group.members.length - visibleMembers.length;
  const openMembers = () => router.push(`/group/members?id=${id}`);
  // 상태 색 뜻: 진행 중(모집중) = success, 끝남(모집완료) = neutral.
  const statusBadge = (
    <Badge tone={groupStatusTone(group.status)}>
      {groupStatusLabel(group.status)}
    </Badge>
  );

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        {/* 동행에는 사진이 없다(서버에 이미지 필드 없음). 대표 사진 자리 없이 일반 상단 바로 둔다. */}
        <TopBar title="소모임" back onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={[
            styles.body,
            isMember || isNonMember ? styles.bodyWithBottomBar : null,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={detail.isRefetching}
              onRefresh={() => void detail.refetch()}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <View style={styles.sheet} testID="group-detail-sheet">
            <View style={styles.header}>
              <View style={styles.chips}>
                {isLeader && isApproved ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`모집 상태 변경: 현재 ${isClosed ? "모집완료" : "모집중"}`}
                    disabled={updateStatusMutation.isPending}
                    hitSlop={{ top: 9, bottom: 9 }}
                    onPress={() => {
                      updateStatusMutation.mutate(isClosed ? "open" : "closed");
                    }}
                  >
                    {statusBadge}
                  </Pressable>
                ) : (
                  statusBadge
                )}
                <Badge tone="info">{group.categoryLabel}</Badge>
              </View>

              <AppText variant="title">{group.name}</AppText>

              <AppText variant="body" style={styles.description}>
                {group.description}
              </AppText>
            </View>

            <View testID="group-detail-info">
              <InfoLine icon="star" label="소모임장" first>
                <Avatar name={leaderName} size={24} />
                <Text style={styles.infoValue}>{leaderName}</Text>
              </InfoLine>
              <InfoLine icon="groups" label="인원">
                <Text style={styles.infoValue}>
                  <Text style={styles.memberCount}>{current}</Text> /{" "}
                  {group.maxMembers}명
                </Text>
              </InfoLine>
              {group.schedule ? (
                <InfoLine icon="schedule" label="일정">
                  <Text style={styles.infoValue}>{group.schedule}</Text>
                </InfoLine>
              ) : null}
              {group.location ? (
                <InfoLine icon="place" label="장소">
                  <Text style={styles.infoValue}>{group.location}</Text>
                </InfoLine>
              ) : null}
            </View>

            {isLeader && group.pendingMembers.length > 0 ? (
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={`가입 신청 ${group.pendingMembers.length}명 확인하기`}
                onPress={openMembers}
                style={styles.pendingBanner}
                testID="group-pending-members"
              >
                <Badge tone="warning">{`가입 신청 ${group.pendingMembers.length}명`}</Badge>
                <Text style={styles.pendingBannerText}>
                  승인을 기다리고 있어요
                </Text>
                <AppIcon
                  name="chevron-right"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </MotionPressable>
            ) : null}

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
                  onPress={openMembers}
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
            ) : null}

            <SectionTitle
              title="멤버"
              count={group.members.length}
              onViewAll={openMembers}
              testID="group-members-section"
            />
            <View style={styles.memberRail}>
              {visibleMembers.map((name) => (
                <View key={name} style={styles.memberItem}>
                  <Avatar name={name} size={44} />
                  <Text numberOfLines={1} style={styles.memberName}>
                    {name}
                  </Text>
                </View>
              ))}
              {hiddenMemberCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`멤버 ${hiddenMemberCount}명 더보기`}
                  onPress={openMembers}
                  style={styles.memberItem}
                  testID="group-members-more"
                >
                  <View style={styles.moreAvatar}>
                    <Text style={styles.moreAvatarText}>
                      +{hiddenMemberCount}
                    </Text>
                  </View>
                  <Text style={styles.moreLabel}>더보기</Text>
                </Pressable>
              ) : null}
            </View>

            <SectionTitle title="공지사항" />
            {group.notices.length === 0 ? (
              <View style={styles.noticeEmpty} testID="group-notice-empty">
                <Text style={styles.noticeEmptyTitle}>아직 공지가 없어요</Text>
                <Text style={styles.noticeEmptyText}>
                  소모임장이 공지를 올리면 여기에 보여요
                </Text>
              </View>
            ) : (
              <View style={styles.noticeList}>
                {group.notices.map((notice, index) => (
                  <View
                    key={notice.id}
                    style={[
                      styles.noticeItem,
                      index < group.notices.length - 1
                        ? styles.noticeDivider
                        : null,
                    ]}
                  >
                    <View style={styles.noticeTitleRow}>
                      <Text numberOfLines={1} style={styles.noticeTitle}>
                        {notice.title}
                      </Text>
                      {notice.isEdited ? (
                        <Text style={styles.editedText}>수정됨</Text>
                      ) : null}
                    </View>
                    <Text numberOfLines={1} style={styles.noticePreview}>
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
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {deleteNotice.isError ? (
          <Text style={styles.noticeError}>공지를 삭제하지 못했어요.</Text>
        ) : null}
        {isMember || isNonMember ? (
          <FloatingBottomBar testID="group-detail-bottom-bar">
            {membershipError ? (
              <Text style={styles.membershipError}>
                {membershipError instanceof Error
                  ? membershipError.message
                  : "소모임 참여 상태를 바꾸지 못했어요."}
              </Text>
            ) : null}
            {isApplicationPending ? (
              <AppText
                variant="caption"
                tone="muted"
                style={styles.membershipHint}
              >
                가입 신청을 보냈어요. 소모임장이 승인하면 참여돼요.
              </AppText>
            ) : isApplicationRejected && !joinBlockedLabel ? (
              <AppText
                variant="caption"
                tone="muted"
                style={styles.membershipHint}
              >
                지난 가입 신청이 반려됐어요. 다시 신청할 수 있어요.
              </AppText>
            ) : null}
            {isMember ? (
              <Button
                testID="group-leave-button"
                variant="outline"
                size="lg"
                accessibilityLabel="소모임 나가기"
                disabled={membershipBusy}
                onPress={() => setShowLeaveConfirm(true)}
              >
                소모임 나가기
              </Button>
            ) : isApplicationPending ? (
              <Button
                testID="group-cancel-application-button"
                variant="outline"
                size="lg"
                accessibilityLabel="가입 신청 취소"
                loading={membershipBusy}
                onPress={() => setShowCancelApplyConfirm(true)}
              >
                가입 신청 취소
              </Button>
            ) : (
              <Button
                testID="group-join-button"
                size="lg"
                accessibilityLabel={joinLabel}
                disabled={joinBlockedLabel !== null}
                loading={membershipBusy}
                onPress={() => {
                  if (joinBlockedLabel) return;
                  joinGroupMutation.mutate(undefined, {
                    onSuccess: (next) => {
                      // 승인이 필요한 모임은 신청만 되고 아직 멤버가 아니다
                      if (next.requiresApproval && !next.isJoined) {
                        Alert.alert(
                          "가입 신청 완료",
                          "신청했어요. 소모임장이 승인하면 참여돼요.",
                        );
                      }
                    },
                  });
                }}
              >
                {joinLabel}
              </Button>
            )}
          </FloatingBottomBar>
        ) : null}
        <ConfirmDialog
          visible={showLeaveConfirm}
          title="소모임에서 나갈까요?"
          message="나가면 모임 글을 볼 수 없어요."
          confirmText="나가기"
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
          visible={showCancelApplyConfirm}
          title="가입 신청을 취소할까요?"
          message="취소한 뒤에도 다시 신청할 수 있어요."
          confirmText="신청 취소"
          cancelText="닫기"
          onCancel={() => setShowCancelApplyConfirm(false)}
          onConfirm={() => {
            if (cancelApplicationMutation.isPending) return;
            cancelApplicationMutation.mutate(undefined, {
              onSettled: () => setShowCancelApplyConfirm(false),
            });
          }}
        />
        <ConfirmDialog
          visible={Boolean(deletingNotice)}
          title="공지를 삭제할까요?"
          message={
            deletingNotice
              ? `“${deletingNotice.title}” 공지는 삭제하면 되돌릴 수 없어요.`
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
          title="소모임을 삭제할까요?"
          message="삭제한 소모임은 되돌릴 수 없어요."
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
          <Text style={styles.noticeError}>소모임을 삭제하지 못했어요.</Text>
        ) : null}
        {updateStatusMutation.isError ? (
          <Text style={styles.noticeError}>모집 상태를 바꾸지 못했어요.</Text>
        ) : null}
      </View>
    </Screen>
  );
}

/** 섹션 머리: 제목 16/700(+ primary-strong 숫자) · 오른쪽 전체보기 12/600 text-muted. */
function SectionTitle({
  title,
  count,
  onViewAll,
  testID,
}: {
  title: string;
  count?: number;
  onViewAll?: () => void;
  testID?: string;
}) {
  return (
    <View style={styles.sectionTitleWrap} testID={testID}>
      <Text style={styles.sectionTitle}>
        {title}
        {count !== undefined ? (
          <Text style={styles.memberCount}> {count}</Text>
        ) : null}
      </Text>
      {onViewAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} 전체보기`}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          onPress={onViewAll}
          style={styles.viewAll}
          testID={testID ? `${testID}-view-all` : undefined}
        >
          <Text style={styles.viewAllText}>전체보기</Text>
          <AppIcon
            name="chevron-right"
            size={16}
            color={theme.colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * 정보 줄(디자인 시스템 PlaceCard 모양). 공통 PlaceCard 는 값이 글자만이라
 * 소모임장 아바타·인원 숫자 강조를 담으려고 값 자리를 children 으로 받는다.
 */
function InfoLine({
  icon,
  label,
  first = false,
  children,
}: {
  icon: ComponentProps<typeof AppIcon>["name"];
  label: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <View
      accessible
      style={[styles.infoRow, first ? styles.infoRowFirst : null]}
    >
      <AppIcon name={icon} size={18} color={theme.colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    minHeight: theme.layout.touchTarget,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.warningSubtle,
  },
  pendingBannerText: {
    flex: 1,
    color: theme.colors.warningText,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  loading: {
    flex: 1,
  },
  loadingBody: {
    padding: theme.layout.screenX,
    gap: theme.layout.listGap,
  },
  noticeError: {
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: theme.spacing[3],
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  body: {
    paddingBottom: theme.spacing[6],
  },
  bodyWithBottomBar: {
    paddingBottom: FLOATING_BOTTOM_BAR_INSET,
  },
  membershipHint: {
    marginBottom: theme.spacing[2],
    textAlign: "center",
  },
  membershipError: {
    marginBottom: theme.spacing[2],
    textAlign: "center",
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  sheet: {
    flexGrow: 1,
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[4],
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  description: {
    marginTop: theme.spacing[3],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  infoRowFirst: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSubtle,
  },
  infoLabel: {
    ...theme.typography.label,
    width: 64,
    color: theme.colors.textMuted,
  },
  infoValueWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  infoValue: {
    ...theme.typography.label,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
  memberCount: {
    color: theme.colors.primaryStrong,
  },
  actionCard: {
    flexDirection: "row",
    marginHorizontal: theme.layout.screenX,
    marginTop: theme.spacing[4],
    padding: theme.spacing[1],
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[3],
  },
  sectionTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  memberRail: {
    flexDirection: "row",
    gap: theme.spacing[3],
    paddingHorizontal: theme.layout.screenX,
  },
  memberItem: {
    width: 56,
    alignItems: "center",
    gap: theme.spacing[2],
  },
  memberName: {
    maxWidth: 56,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
    textAlign: "center",
  },
  moreAvatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  moreAvatarText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  moreLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticeList: {
    paddingHorizontal: theme.layout.screenX,
  },
  noticeItem: {
    paddingVertical: theme.spacing[3],
  },
  noticeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noticeTitle: {
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  editedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticePreview: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  noticeWhen: {
    marginTop: theme.spacing[1],
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticeActions: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
    gap: 14,
  },
  noticeEmpty: {
    paddingHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[3],
    gap: 2,
  },
  noticeEmptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  noticeEmptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
