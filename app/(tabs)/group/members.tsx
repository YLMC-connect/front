import { Radio } from "@/components/ui/checkbox";
import { InfoBox } from "@/components/ui/info-box";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  ConfirmDialog,
  ErrorState,
  FloatingBottomBar,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { communionApiErrorMessages } from "../../../src/constants/apiErrorMessages";
import {
  useGroupMembers,
  useKickGroupMember,
  useTransferGroupLeader,
  useUpdateGroupMemberStatus,
} from "../../../src/hooks/useGroups";
import { getApiErrorMessage } from "../../../src/lib/apiErrorMessage";
import type { GroupMemberDetail } from "../../../src/types/group";

export default function GroupMembersScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    groupId?: string;
    mode?: string;
  }>();
  const groupId = params.groupId ?? params.id ?? "1";
  const membersQuery = useGroupMembers(groupId);
  const kickMemberMutation = useKickGroupMember(groupId);
  const transferLeaderMutation = useTransferGroupLeader(groupId);
  const memberStatusMutation = useUpdateGroupMemberStatus(groupId);
  const [kickingMember, setKickingMember] = useState<GroupMemberDetail | null>(
    null,
  );
  const [selectedTransferMember, setSelectedTransferMember] =
    useState<GroupMemberDetail | null>(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>();
  const transferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (transferTimerRef.current) clearTimeout(transferTimerRef.current);
    };
  }, []);

  const allMembers = membersQuery.data ?? [];
  // 승인 대기 신청은 소모임장에게만 오고, 멤버 목록과 따로 보인다
  const members = allMembers.filter((member) => member.status === "approved");
  const pendingMembers = allMembers.filter(
    (member) => member.status === "pending",
  );
  const decide = (member: GroupMemberDetail, approve: boolean) => {
    if (memberStatusMutation.isPending) return;
    memberStatusMutation.mutate(
      {
        targetUserId: member.userId,
        status: approve ? "approved" : "rejected",
      },
      {
        onSuccess: () =>
          setToastMessage(
            approve
              ? `${member.userName}님의 가입을 승인했어요`
              : `${member.userName}님의 가입 신청을 반려했어요`,
          ),
        onError: (error) =>
          setToastMessage(
            getApiErrorMessage(
              error,
              communionApiErrorMessages,
              approve
                ? "가입을 승인하지 못했어요."
                : "가입 신청을 반려하지 못했어요.",
            ),
          ),
      },
    );
  };
  // 소모임 상세의 "전체보기" 로 일반 멤버도 들어온다. 내보내기는 소모임장에게만 보인다.
  // 목록이 오기 전에는 주로 들어오는 소모임장 기준 제목("멤버 관리")을 둔다.
  const canManage =
    !membersQuery.data ||
    members.some((member) => member.isMine && member.isLeader);
  const isTransfer = params.mode === "transfer";
  const transferTargetName = selectedTransferMember?.userName ?? null;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={
            isTransfer ? "소모임장 이관" : canManage ? "멤버 관리" : "멤버"
          }
          back
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={[
            styles.body,
            isTransfer ? styles.bodyWithBottomBar : null,
          ]}
        >
          {membersQuery.isPending ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : membersQuery.isError ? (
            <ErrorState message="멤버 정보를 다시 불러와주세요." />
          ) : isTransfer ? (
            <InfoBox
              tone="warning"
              description="이관 후에는 일반 멤버로 변경되며 권한이 즉시 사라집니다."
              style={styles.warningBox}
            />
          ) : (
            <>
              {canManage && pendingMembers.length > 0 ? (
                <View testID="group-pending-section">
                  <Text style={styles.total}>
                    가입 신청 {pendingMembers.length}명
                  </Text>
                  {pendingMembers.map((member, index) => (
                    <MemberInfo
                      key={member.userId}
                      member={member}
                      style={[
                        styles.memberRow,
                        index < pendingMembers.length - 1
                          ? styles.rowBorder
                          : null,
                      ]}
                      trailing={
                        <View style={styles.decisionRow}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${member.userName} 가입 반려`}
                            disabled={memberStatusMutation.isPending}
                            hitSlop={{ top: 6, bottom: 6 }}
                            onPress={() => decide(member, false)}
                            style={styles.kickButton}
                            testID={`member-reject-${member.userId}`}
                          >
                            <Text style={styles.kickText}>반려</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${member.userName} 가입 승인`}
                            disabled={memberStatusMutation.isPending}
                            hitSlop={{ top: 6, bottom: 6 }}
                            onPress={() => decide(member, true)}
                            style={[styles.kickButton, styles.approveButton]}
                            testID={`member-approve-${member.userId}`}
                          >
                            <Text style={[styles.kickText, styles.approveText]}>
                              승인
                            </Text>
                          </Pressable>
                        </View>
                      }
                    />
                  ))}
                </View>
              ) : null}
              <Text style={styles.total}>전체 {members.length}명</Text>
            </>
          )}

          {members.map((member, index) => (
            <MemberRow
              key={member.userId}
              member={member}
              transfer={isTransfer}
              canManage={canManage}
              selected={selectedTransferMember?.userId === member.userId}
              last={index === members.length - 1}
              onKick={() => setKickingMember(member)}
              onSelect={() => setSelectedTransferMember(member)}
            />
          ))}
        </ScrollView>

        {isTransfer && membersQuery.data ? (
          <FloatingBottomBar
            disabled={!transferTargetName}
            label="이관하기"
            onPress={() => setShowTransferConfirm(true)}
            testID="group-transfer-submit"
          />
        ) : null}

        <ConfirmDialog
          visible={Boolean(kickingMember)}
          title={`${kickingMember?.userName ?? ""}님을 내보낼까요?`}
          message="내보낸 멤버는 다시 신청해야 들어올 수 있어요."
          confirmText="내보내기"
          danger
          onCancel={() => setKickingMember(null)}
          onConfirm={async () => {
            if (!kickingMember || kickMemberMutation.isPending) return;
            try {
              const name = kickingMember.userName;
              await kickMemberMutation.mutateAsync(kickingMember.userId);
              setKickingMember(null);
              setToastMessage(`${name}님을 내보냈어요`);
            } catch (error) {
              setKickingMember(null);
              setToastMessage(
                getApiErrorMessage(
                  error,
                  communionApiErrorMessages,
                  "멤버를 내보내지 못했어요.",
                ),
              );
            }
          }}
        />
        <ConfirmDialog
          visible={showTransferConfirm}
          title={`${transferTargetName ?? "멤버"}님께 소모임장을 이관할까요?`}
          message="이관 즉시 본인은 일반 멤버로 변경되며 되돌릴 수 없습니다."
          confirmText="이관"
          onCancel={() => setShowTransferConfirm(false)}
          onConfirm={() => {
            if (!selectedTransferMember || transferLeaderMutation.isPending) {
              return;
            }
            const target = selectedTransferMember;
            setShowTransferConfirm(false);
            void transferLeaderMutation
              .mutateAsync(target.userId)
              .then(() => {
                setToastMessage(
                  `${target.userName}님께 소모임장이 이관되었습니다`,
                );
                transferTimerRef.current = setTimeout(() => {
                  try {
                    router.back?.();
                  } catch {
                    // 의도된 무시: 이관 안내 뒤 자동 뒤로가기. 이미 화면을 벗어났으면 할 일이 없다.
                  }
                }, 700);
              })
              .catch((error: unknown) => {
                setToastMessage(
                  getApiErrorMessage(
                    error,
                    communionApiErrorMessages,
                    "소모임장을 이관하지 못했습니다.",
                  ),
                );
              });
          }}
        />
        <Toast message={toastMessage} offset={28} />
      </View>
    </Screen>
  );
}

function MemberRow({
  member,
  transfer,
  canManage,
  selected,
  last,
  onKick,
  onSelect,
}: {
  member: GroupMemberDetail;
  transfer: boolean;
  canManage: boolean;
  selected: boolean;
  last: boolean;
  onKick?: () => void;
  onSelect?: () => void;
}) {
  const candidate = transfer && !member.isLeader;
  // 내보내기: Outline 작은 버튼(높이 32, surface + 1px border-button, 12/600 text).
  const kickButton =
    !transfer && canManage && !member.isLeader ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${member.userName} 내보내기`}
        hitSlop={{ top: 6, bottom: 6 }}
        style={styles.kickButton}
        onPress={onKick}
        testID={`member-kick-${member.userId}`}
      >
        <Text style={styles.kickText}>내보내기</Text>
      </Pressable>
    ) : null;

  if (candidate && onSelect) {
    // 소모임장 이관 후보: 줄 전체가 작은 라디오(디자인 시스템 Checkbox radio).
    return (
      <Radio
        checked={selected}
        onChange={onSelect}
        accessibilityLabel={member.userName}
        testID={`member-transfer-${member.userId}`}
        style={[styles.radioRow, !last ? styles.rowBorder : null]}
        label={<MemberInfo member={member} />}
      />
    );
  }

  return (
    <MemberInfo
      member={member}
      trailing={kickButton}
      style={[
        styles.memberRow,
        !last ? styles.rowBorder : null,
        // 이관 화면의 현재 소모임장은 고를 수 없어 흐리게 둔다(opacity-disabled).
        transfer && member.isLeader ? styles.rowDisabled : null,
      ]}
    />
  );
}

/** 사람 한 줄: 아바타 40 · 이름 16/600 옆 작은 배지(나·소모임장) · 가입일 12 text-muted. */
function MemberInfo({
  member,
  trailing,
  style,
}: {
  member: GroupMemberDetail;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.person, style]}>
      <Avatar name={member.userName} size={40} seed={member.userName} />
      <View style={styles.personBody}>
        <View style={styles.nameLine}>
          <Text numberOfLines={1} style={styles.name}>
            {member.userName}
          </Text>
          {member.isMine ? (
            <View style={[styles.tag, styles.tagNeutral]}>
              <Text style={[styles.tagText, styles.tagTextNeutral]}>나</Text>
            </View>
          ) : null}
          {member.isLeader ? (
            <View style={[styles.tag, styles.tagLeader]}>
              <Text style={[styles.tagText, styles.tagTextLeader]}>
                소모임장
              </Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.joined}>
          {member.joinedLabel} 가입
        </Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingBottom: 24,
  },
  bodyWithBottomBar: {
    paddingBottom: 88,
  },
  loading: {
    paddingTop: 80,
    alignItems: "center",
  },
  warningBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 4,
    marginBottom: 14,
  },
  total: {
    paddingHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[2],
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowDisabled: {
    opacity: theme.opacity.disabled,
  },
  radioRow: {
    paddingHorizontal: theme.layout.screenX,
  },
  memberRow: {
    marginHorizontal: theme.layout.screenX,
  },
  person: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  personBody: {
    flex: 1,
    minWidth: 0,
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  name: {
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  joined: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  // 이름 옆 작은 배지: 모서리 6, 안쪽 0×6, 12/600.
  tag: {
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  tagNeutral: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  tagLeader: {
    backgroundColor: theme.colors.primarySubtle,
  },
  tagText: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  tagTextNeutral: {
    color: theme.colors.neutral700,
  },
  tagTextLeader: {
    color: theme.colors.primaryStrong,
  },
  kickButton: {
    height: theme.size.chipHeight,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[3],
    justifyContent: "center",
  },
  decisionRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  approveButton: {
    borderColor: theme.colors.primarySubtle,
    backgroundColor: theme.colors.primarySubtle,
  },
  approveText: {
    color: theme.colors.primaryStrong,
  },
  kickText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
});
