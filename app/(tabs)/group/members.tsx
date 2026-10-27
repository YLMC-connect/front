import { AppIcon } from "@/components/ui/app-icon";
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
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useGroupMembers,
  useKickGroupMember,
} from "../../../src/hooks/useGroups";
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
            <View style={styles.warningBox}>
              <AppIcon
                name="warning-amber"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={styles.warningText}>
                이관 후에는 일반 멤버로 변경되며 권한이 즉시 사라집니다.
              </Text>
            </View>
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
          <View style={styles.bottomBar}>
            <Button
              testID="group-transfer-submit"
              disabled={!transferTargetName}
              onPress={() => setShowTransferConfirm(true)}
            >
              이관하기
            </Button>
          </View>
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
            } catch {
              setKickingMember(null);
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
            setShowTransferConfirm(false);
            setToastMessage(
              `${transferTargetName}님께 소모임장이 이관되었습니다`,
            );
            transferTimerRef.current = setTimeout(() => {
              try {
                router.back?.();
              } catch {
                // ignore
              }
            }, 700);
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

  const content = (
    <View
      style={[
        styles.row,
        !last ? styles.rowBorder : null,
        transfer && member.isLeader ? styles.rowDisabled : null,
        selected ? styles.rowSelected : null,
      ]}
    >
      {candidate ? <RadioMark selected={selected} /> : null}
      <Avatar name={member.userName} seed={member.userName} size={42} />
      <View style={styles.memberText}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.userName}</Text>
          {member.isMine ? <Text style={styles.me}>(나)</Text> : null}
          {member.isLeader ? (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderText}>소모임장</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.joined}>{member.joinedLabel} 가입</Text>
      </View>
      {!transfer && !member.isLeader ? (
        <Pressable
          accessibilityRole="button"
          style={styles.kickButton}
          onPress={onKick}
        >
          <AppIcon name="close" size={12} color={theme.colors.danger} />
          <Text style={styles.kickText}>강퇴</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (candidate && onSelect) {
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        testID={`member-transfer-${member.userId}`}
        onPress={onSelect}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected ? styles.radioSelected : null]}>
      {selected ? <View style={styles.radioDot} /> : null}
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
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(201,124,110,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: "#A8643F",
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  total: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  row: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },
  memberText: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.bold,
  },
  me: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  leaderBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  leaderText: {
    color: theme.colors.white,
    fontSize: 10.5,
    fontWeight: theme.fontWeight.bold,
  },
  joined: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  kickButton: {
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(201,124,110,0.10)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kickText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
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
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.glass,
  },
});
