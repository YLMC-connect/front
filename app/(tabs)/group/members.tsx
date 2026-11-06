import { AppIcon } from "@/components/ui/app-icon";
import { Radio } from "@/components/ui/checkbox";
import { InfoBox } from "@/components/ui/info-box";
import { PersonRow } from "@/components/ui/list-row";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  Badge,
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
} from "../../../src/hooks/useGroups";
import { getApiErrorMessage } from "../../../src/lib/apiErrorMessage";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { GroupMemberDetail } from "../../../src/types/group";

export default function GroupMembersScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    groupId?: string;
    mode?: string;
    designVariant?: string;
  }>();
  const groupId = params.groupId ?? params.id ?? "1";
  const variant = readDesignVariant(params.designVariant) ?? "default";
  const membersQuery = useGroupMembers(groupId);
  const kickMemberMutation = useKickGroupMember(groupId);
  const transferLeaderMutation = useTransferGroupLeader(groupId);
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

  const members = membersQuery.data ?? [];
  const isTransfer =
    params.mode === "transfer" ||
    variant === "transfer" ||
    variant === "transfer-confirm";
  const transferTargetName =
    selectedTransferMember?.userName ??
    (variant.startsWith("transfer") ? "박정아" : null);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={isTransfer ? "소모임장 이관" : "멤버 관리"}
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
            <Text style={styles.total}>전체 {members.length}명</Text>
          )}

          {members.map((member, index) => (
            <MemberRow
              key={member.userId}
              member={member}
              transfer={isTransfer}
              selected={
                selectedTransferMember?.userId === member.userId ||
                member.userName === transferTargetName
              }
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
          visible={variant === "kick-confirm" || Boolean(kickingMember)}
          title={`${variant === "kick-confirm" ? "이수진" : (kickingMember?.userName ?? "")}님을 강퇴하시겠습니까?`}
          message="강퇴된 멤버는 다시 신청할 수 없어요."
          confirmText="강퇴"
          danger
          onCancel={() => {
            if (variant === "kick-confirm") {
              router.back();
            } else {
              setKickingMember(null);
            }
          }}
          onConfirm={async () => {
            if (variant === "kick-confirm") {
              router.back();
              return;
            }
            if (!kickingMember || kickMemberMutation.isPending) return;
            try {
              const name = kickingMember.userName;
              await kickMemberMutation.mutateAsync(kickingMember.userId);
              setKickingMember(null);
              setToastMessage(`${name}님이 강퇴되었습니다`);
            } catch (error) {
              setKickingMember(null);
              setToastMessage(
                getApiErrorMessage(
                  error,
                  communionApiErrorMessages,
                  "멤버를 강퇴하지 못했습니다.",
                ),
              );
            }
          }}
        />
        <ConfirmDialog
          visible={variant === "transfer-confirm" || showTransferConfirm}
          title={`${transferTargetName ?? "멤버"}님께 소모임장을 이관할까요?`}
          message="이관 즉시 본인은 일반 멤버로 변경되며 되돌릴 수 없습니다."
          confirmText="이관"
          onCancel={() => {
            if (variant === "transfer-confirm") {
              router.back();
            } else {
              setShowTransferConfirm(false);
            }
          }}
          onConfirm={() => {
            if (variant === "transfer-confirm") {
              router.back();
              return;
            }
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
        <Toast
          message={
            variant === "kick-toast"
              ? "이수진님이 강퇴되었습니다"
              : toastMessage
          }
          offset={28}
        />
      </View>
    </Screen>
  );
}

function MemberRow({
  member,
  transfer,
  selected,
  last,
  onKick,
  onSelect,
}: {
  member: GroupMemberDetail;
  transfer: boolean;
  selected: boolean;
  last: boolean;
  onKick?: () => void;
  onSelect?: () => void;
}) {
  const candidate = transfer && !member.isLeader;
  const trailing = (
    <View style={styles.trailing}>
      {member.isMine ? <Badge tone="neutral">나</Badge> : null}
      {member.isLeader ? <Badge tone="info">소모임장</Badge> : null}
      {!transfer && !member.isLeader ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${member.userName} 강퇴`}
          hitSlop={{ top: 6, bottom: 6 }}
          style={styles.kickButton}
          onPress={onKick}
        >
          <AppIcon name="close" size={12} color={theme.colors.dangerText} />
          <Text style={styles.kickText}>강퇴</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (candidate && onSelect) {
    // 소모임장 이관 후보: 줄 전체가 작은 라디오(디자인 시스템 Checkbox radio).
    return (
      <Radio
        checked={selected}
        onChange={onSelect}
        accessibilityLabel={member.userName}
        testID={`member-transfer-${member.userId}`}
        style={[styles.radioRow, !last ? styles.rowBorder : null]}
        label={
          <PersonRow
            name={member.userName}
            avatarSeed={member.userName}
            subtitle={`${member.joinedLabel} 가입`}
            trailing={trailing}
            divider={false}
            style={styles.radioPerson}
          />
        }
      />
    );
  }

  return (
    <PersonRow
      name={member.userName}
      avatarSeed={member.userName}
      subtitle={`${member.joinedLabel} 가입`}
      trailing={trailing}
      divider={!last}
      // 이관 화면의 현재 소모임장은 고를 수 없어 흐리게 둔다(opacity-disabled).
      style={transfer && member.isLeader ? styles.rowDisabled : null}
    />
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
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
  radioPerson: {
    paddingHorizontal: 0,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  kickButton: {
    minHeight: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.dangerSubtle,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kickText: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.barGlass,
  },
});
