import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  SegmentedTabs,
  TextField,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useAuth } from "../../../src/hooks/useAuth";
import { useMyPage } from "../../../src/hooks/useMyPage";

type ActivityTab = "market" | "group" | "favorite";

const activityTabs = [
  { key: "market", label: "나눔" },
  { key: "group", label: "소모임" },
  { key: "favorite", label: "관심" },
] as const;

export default function MyPageScreen() {
  const { currentUser, logout } = useAuth();
  const { data } = useMyPage();
  const [activityTab, setActivityTab] = useState<ActivityTab>("market");
  const [phone, setPhone] = useState("010-1234-5678");
  const [password, setPassword] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toast, setToast] = useState("");
  const myMarket = data?.marketItems ?? [];
  const myGroups = data?.groups ?? [];
  const myCourses = data?.lifeStudyCourses ?? [];
  const myPrayerRooms = data?.prayerRooms ?? [];
  const favoriteItems = data?.favoriteTitles ?? [];
  const faqs = data?.faqs ?? [];

  const submitLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Screen>
      <TopBar testID="screen-mypage" title="마이페이지" />
      <Card style={styles.profile}>
        <Avatar name={currentUser?.name ?? "?"} size={64} />
        <View style={styles.profileText}>
          <Text style={styles.name}>{currentUser?.name ?? "성도"}</Text>
          <Text style={styles.meta}>
            {currentUser?.department ?? "목장 정보 자동 매칭 예정"}
          </Text>
        </View>
        <Pressable accessibilityRole="button" style={styles.editLink}>
          <Text style={styles.editLinkText}>프로필 수정</Text>
        </Pressable>
      </Card>

      <View style={styles.summary}>
        <Summary label="나눔" value={myMarket.length} />
        <Summary label="소모임" value={myGroups.length} />
        <Summary label="삶공부" value={myCourses.length} />
        <Summary label="기도방" value={myPrayerRooms.length} />
      </View>

      <Section title="프로필 수정">
        <Card style={styles.formCard}>
          <Text style={styles.helper}>
            이름과 목장 정보는 교회 DB 기준으로 표시됩니다.
          </Text>
          <TextField
            label="휴대폰"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextField
            label="새 비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="변경할 때만 입력"
          />
          <Button
            variant="soft"
            onPress={() => {
              setPassword("");
              setToast("프로필 변경 mock 저장이 완료되었습니다.");
            }}
          >
            변경 저장
          </Button>
        </Card>
      </Section>

      <Section title="활동 관리">
        <SegmentedTabs
          items={activityTabs}
          active={activityTab}
          onChange={setActivityTab}
        />
        <Card style={styles.menu}>
          {activityTab === "market"
            ? myMarket.map((item) => (
                <MenuRow
                  key={item.id}
                  icon="redeem"
                  title={item.title}
                  value={item.status === "done" ? "완료" : "진행중"}
                />
              ))
            : null}
          {activityTab === "group"
            ? myGroups.map((group) => (
                <MenuRow
                  key={group.id}
                  icon="groups"
                  title={group.name}
                  value={group.isJoined ? "참여중" : "관심"}
                />
              ))
            : null}
          {activityTab === "favorite"
            ? favoriteItems.map((title) => (
                <MenuRow key={title} icon="star" title={title} value="관심" />
              ))
            : null}
        </Card>
      </Section>

      <Section title="고객센터">
        <Card style={styles.faqCard}>
          {faqs.map((faq, index) => (
            <Pressable
              key={faq.question}
              style={styles.faqItem}
              onPress={() =>
                setOpenFaqIndex(openFaqIndex === index ? null : index)
              }
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.menuTitle}>{faq.question}</Text>
                <MaterialIcons
                  name={openFaqIndex === index ? "expand-less" : "expand-more"}
                  size={22}
                  color={theme.colors.inkHint}
                />
              </View>
              {openFaqIndex === index ? (
                <Text style={styles.helper}>{faq.answer}</Text>
              ) : null}
            </Pressable>
          ))}
          <MenuRow icon="support-agent" title="문의" value="교회 사무실" />
          <MenuRow icon="description" title="약관·개인정보" value="후속 화면" />
        </Card>
      </Section>

      <View style={styles.accountActions}>
        <Button variant="soft" onPress={() => setLogoutOpen(true)}>
          로그아웃
        </Button>
        <Button variant="ghost" onPress={() => setWithdrawOpen(true)}>
          회원 탈퇴
        </Button>
      </View>
      <ConfirmDialog
        visible={logoutOpen}
        title="로그아웃할까요?"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={submitLogout}
        confirmText="로그아웃"
      />
      <ConfirmDialog
        visible={withdrawOpen}
        title="회원 탈퇴"
        message="탈퇴는 관리자 확인이 필요한 soft delete 흐름으로 연결될 예정입니다."
        onCancel={() => setWithdrawOpen(false)}
        onConfirm={() => {
          setWithdrawOpen(false);
          setToast("회원 탈퇴 요청 mock 접수 상태입니다.");
        }}
        confirmText="요청"
      />
      <Toast message={toast} />
    </Screen>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </Card>
  );
}

function MenuRow({
  icon,
  title,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.menuRow}>
      <MaterialIcons name={icon} size={22} color={theme.colors.primaryDeep} />
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.meta}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18 },
  profileText: { flex: 1 },
  name: { color: theme.colors.ink, fontSize: 20, fontWeight: "900" },
  meta: { color: theme.colors.inkMute, fontSize: 13, fontWeight: "600" },
  editLink: { paddingVertical: 8, paddingHorizontal: 4 },
  editLinkText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "800",
  },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 18 },
  summaryValue: {
    color: theme.colors.primaryDeep,
    fontSize: 24,
    fontWeight: "900",
  },
  formCard: { gap: 12 },
  helper: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  menu: { paddingVertical: 4 },
  menuRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuTitle: { flex: 1, color: theme.colors.ink, fontWeight: "800" },
  faqCard: { gap: 4 },
  faqItem: { paddingVertical: 12, gap: 8 },
  faqQuestion: { flexDirection: "row", alignItems: "center", gap: 10 },
  accountActions: { flexDirection: "row", gap: 8 },
});
