import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Button,
  ConfirmDialog,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

const members = [
  { name: "김은혜", leader: true, joined: "2024.03.12", me: true },
  { name: "박정아", joined: "2024.04.02", leader: false, me: false },
  { name: "이수진", joined: "2024.05.18", leader: false, me: false },
  { name: "김지영", joined: "2024.07.21", leader: false, me: false },
  { name: "정혜진", joined: "2024.09.04", leader: false, me: false },
  { name: "조미경", joined: "2024.11.10", leader: false, me: false },
  { name: "한유라", joined: "2025.01.22", leader: false, me: false },
  { name: "강민서", joined: "2025.03.05", leader: false, me: false },
] as const;

function variantOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "default") : (value ?? "default");
}

export default function GroupMembersScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = variantOf(params.variant);
  const isTransfer = variant === "transfer" || variant === "transfer-confirm";
  const transferTarget = isTransfer ? "박정아" : null;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={isTransfer ? "소모임장 이관" : "멤버 관리"}
          back
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={styles.body}>
          {isTransfer ? (
            <View style={styles.warningBox}>
              <MaterialIcons
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
              key={member.name}
              member={member}
              transfer={isTransfer}
              selected={member.name === transferTarget}
              last={index === members.length - 1}
            />
          ))}
        </ScrollView>

        {isTransfer ? (
          <View style={styles.bottomBar}>
            <Button disabled={!transferTarget}>이관하기</Button>
          </View>
        ) : null}

        <ConfirmDialog
          visible={variant === "kick-confirm"}
          title="이수진님을 강퇴하시겠습니까?"
          message="강퇴된 멤버는 다시 신청할 수 없어요."
          confirmText="강퇴"
          danger
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
        <ConfirmDialog
          visible={variant === "transfer-confirm"}
          title="박정아님께 소모임장을 이관할까요?"
          message="이관 즉시 본인은 일반 멤버로 변경되며 되돌릴 수 없습니다."
          confirmText="이관"
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
        <Toast
          message={
            variant === "kick-toast" ? "이수진님이 강퇴되었습니다" : undefined
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
}: {
  member: (typeof members)[number];
  transfer: boolean;
  selected: boolean;
  last: boolean;
}) {
  const candidate = transfer && !member.leader;

  return (
    <View
      style={[
        styles.row,
        !last ? styles.rowBorder : null,
        transfer && member.leader ? styles.rowDisabled : null,
        selected ? styles.rowSelected : null,
      ]}
    >
      {candidate ? <RadioMark selected={selected} /> : null}
      <Avatar name={member.name} seed={member.name} size={42} />
      <View style={styles.memberText}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.name}</Text>
          {member.me ? <Text style={styles.me}>(나)</Text> : null}
          {member.leader ? (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderText}>소모임장</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.joined}>{member.joined} 가입</Text>
      </View>
      {!transfer && !member.leader ? (
        <Pressable accessibilityRole="button" style={styles.kickButton}>
          <MaterialIcons name="close" size={12} color={theme.colors.danger} />
          <Text style={styles.kickText}>강퇴</Text>
        </Pressable>
      ) : null}
    </View>
  );
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
