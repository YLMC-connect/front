import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  TextField,
  Textarea,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  GroupDetailReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";
import { useAuth } from "../../../src/hooks/useAuth";
import {
  useAddGroupNotice,
  useGroup,
  useJoinGroup,
  useLeaveGroup,
  useRemoveGroupMember,
  useToggleGroupFavorite,
} from "../../../src/hooks/useGroups";

export default function GroupDetailScreen() {
  const { id, variant } = useLocalSearchParams<{
    id: string;
    variant?: string;
  }>();
  const groupId = id ?? "";
  const { currentUser } = useAuth();
  const { data: group, isError } = useGroup(groupId);
  const join = useJoinGroup(groupId);
  const leave = useLeaveGroup(groupId);
  const toggleFavorite = useToggleGroupFavorite(groupId);
  const removeMember = useRemoveGroupMember(groupId);
  const addNotice = useAddGroupNotice(groupId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [toast, setToast] = useState("");

  if (variant) {
    return <GroupDetailReferenceScreen variant={variantOf(variant)} />;
  }

  if (isError)
    return (
      <Screen>
        <EmptyState title="존재하지 않는 소모임입니다" icon="error-outline" />
      </Screen>
    );
  if (!group)
    return (
      <Screen>
        <Text style={styles.meta}>소모임을 불러오는 중입니다.</Text>
      </Screen>
    );

  const isLeader = currentUser?.id === group.leader.id;

  const submitNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    addNotice.mutate(
      { title: noticeTitle.trim(), content: noticeContent.trim() },
      {
        onSuccess: () => {
          setNoticeTitle("");
          setNoticeContent("");
          setSheetOpen(false);
          setToast("공지사항이 등록되었습니다.");
        },
      },
    );
  };

  return (
    <Screen>
      <TopBar title="소모임 상세" back onBack={() => router.back()} />
      <View style={styles.cover}>
        {group.coverImage ? (
          <Image
            source={{ uri: group.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons
            name={group.category === "carpool" ? "directions-car" : "groups"}
            size={54}
            color={theme.colors.primaryDeep}
          />
        )}
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{group.name}</Text>
        <Badge tone={group.status === "open" ? "success" : "mute"}>
          {group.status === "open" ? "모집중" : "모집완료"}
        </Badge>
      </View>
      <Text style={styles.description}>{group.description}</Text>
      <Card style={styles.info}>
        <InfoRow icon="event" label="일정" value={group.schedule} />
        <InfoRow icon="place" label="장소" value={group.location} />
        <InfoRow
          icon="people"
          label="인원"
          value={`${group.members.length} / ${group.maxMembers}명`}
        />
      </Card>

      <View style={styles.actions}>
        {group.isJoined ? (
          <Button
            variant="soft"
            onPress={() =>
              leave.mutate(undefined, {
                onSuccess: () => setToast("소모임에서 나왔습니다."),
                onError: (error) =>
                  setToast(
                    error instanceof Error
                      ? error.message
                      : "탈퇴할 수 없습니다.",
                  ),
              })
            }
          >
            탈퇴하기
          </Button>
        ) : (
          <Button
            disabled={group.status === "closed"}
            onPress={() =>
              join.mutate(undefined, {
                onSuccess: () => setToast("참여 신청이 완료되었습니다."),
                onError: (error) =>
                  setToast(
                    error instanceof Error
                      ? error.message
                      : "참여할 수 없습니다.",
                  ),
              })
            }
          >
            참여하기
          </Button>
        )}
        <Button
          variant={group.isFavorite ? "danger" : "soft"}
          icon={group.isFavorite ? "star" : "star-border"}
          onPress={() =>
            toggleFavorite.mutate(undefined, {
              onSuccess: () =>
                setToast(
                  group.isFavorite
                    ? "관심 소모임에서 제거했습니다."
                    : "관심 소모임에 담았습니다.",
                ),
            })
          }
        >
          관심
        </Button>
        <Button
          variant="ghost"
          icon="campaign"
          onPress={() => setSheetOpen(true)}
        >
          공지 작성
        </Button>
      </View>

      <Section title="공지사항">
        {group.notices.length === 0 ? (
          <Text style={styles.meta}>아직 공지사항이 없습니다.</Text>
        ) : null}
        {group.notices.map((notice) => (
          <Card key={notice.id} style={styles.notice}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.meta}>{notice.content}</Text>
          </Card>
        ))}
      </Section>

      <Section title="멤버">
        <View style={styles.members}>
          {group.members.map((member) => (
            <View key={member.id} style={styles.member}>
              <Avatar name={member.name} size={34} />
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.meta}>
                  {member.id === group.leader.id
                    ? "소모임장"
                    : member.department}
                </Text>
              </View>
              {isLeader && member.id !== group.leader.id ? (
                <Button
                  variant="ghost"
                  onPress={() =>
                    removeMember.mutate(member.id, {
                      onSuccess: () => setToast("멤버를 내보냈습니다."),
                    })
                  }
                >
                  내보내기
                </Button>
              ) : null}
            </View>
          ))}
        </View>
      </Section>

      <BottomSheet
        visible={sheetOpen}
        title="소모임 공지 작성"
        onClose={() => setSheetOpen(false)}
      >
        <View style={styles.sheetForm}>
          <TextField
            label="제목"
            value={noticeTitle}
            onChangeText={setNoticeTitle}
          />
          <Textarea
            label="내용"
            value={noticeContent}
            onChangeText={setNoticeContent}
          />
          <Button onPress={submitNotice} loading={addNotice.isPending}>
            등록
          </Button>
        </View>
      </BottomSheet>
      <Toast message={toast} />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color={theme.colors.primaryDeep} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 210,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.primaryTint,
  },
  coverImage: { width: "100%", height: "100%" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  description: { color: theme.colors.inkSoft, fontSize: 15, lineHeight: 23 },
  info: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  infoLabel: {
    color: theme.colors.inkMute,
    fontSize: 13,
    fontWeight: "800",
    width: 42,
  },
  infoValue: { color: theme.colors.ink, fontWeight: "700", flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  meta: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  notice: { gap: 6 },
  noticeTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 15 },
  members: { gap: 10 },
  member: { flexDirection: "row", alignItems: "center", gap: 10 },
  memberText: { flex: 1 },
  memberName: { color: theme.colors.ink, fontWeight: "800" },
  sheetForm: { gap: 12 },
});
