import { AppIcon } from "@/components/ui/app-icon";
import { useRouter, type Href } from "expo-router";
import { useState, type ComponentProps } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import { Avatar, Card, ConfirmDialog, TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useMemberMe } from "../../src/hooks/useMember";

type IconName = ComponentProps<typeof AppIcon>["name"];

type MenuItem = {
  label: string;
  icon: IconName;
  /** 오른쪽 보조 글자(12 text-muted). */
  meta?: string;
  href?: Href;
  action?: "logout";
};

const menuGroups: readonly { title: string; items: MenuItem[] }[] = [
  {
    title: "내 활동",
    items: [
      {
        label: "활동 내역",
        icon: "history",
        meta: "나눔 · 댓글 · 소모임",
        href: "/mypage/activity",
      },
      {
        label: "중보기도 활동",
        icon: "hands-pray",
        href: "/mypage/prayer-history",
      },
      {
        label: "삶공부 수강 내역",
        icon: "menu-book",
        href: "/mypage/life-study-history",
      },
    ],
  },
  {
    title: "계정",
    items: [
      {
        label: "비밀번호 변경",
        icon: "verified-user",
        href: "/mypage/password",
      },
      { label: "로그아웃", icon: "logout", action: "logout" },
    ],
  },
  {
    title: "고객센터",
    items: [
      { label: "자주 묻는 질문", icon: "help-outline", href: "/mypage/faq" },
      { label: "약관 · 정책", icon: "description", href: "/mypage/terms" },
    ],
  },
];

export default function MyPageScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const memberQuery = useMemberMe();
  const member = memberQuery.data;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const memberName = member?.name || "사용자";
  const churchLabel = member?.department
    ? `열린문교회 · ${member.department}`
    : "열린문교회";

  const handleMenuPress = (item: MenuItem) => {
    if (item.action === "logout") {
      setShowLogoutConfirm(true);
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
    } catch (error) {
      // 기기 토큰 삭제가 실패해도 메모리 세션은 비워지므로 로그인 화면으로 보낸다.
      if (__DEV__) console.warn("[mypage] 로그아웃 정리 실패", error);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="마이페이지" back onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={memberQuery.isRefetching}
              onRefresh={() => void memberQuery.refetch()}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* 프로필 줄 전체를 누르면 프로필 수정으로 간다. */}
          <Card
            style={styles.profileCard}
            onPress={() => router.push("/mypage/edit")}
            accessibilityLabel="프로필 수정"
            testID="mypage-profile"
          >
            <Avatar
              name={memberName}
              size={56}
              seed={member?.id || memberName}
            />
            <View style={styles.profileText}>
              <Text style={styles.name}>{memberName}</Text>
              <Text style={styles.church}>{churchLabel}</Text>
            </View>
            <View style={styles.editHint}>
              <Text style={styles.editText}>프로필 수정</Text>
              <AppIcon
                name="chevron-right"
                size={18}
                color={theme.colors.borderStrong}
              />
            </View>
          </Card>

          {menuGroups.map((group) => (
            <MenuSection
              key={group.title}
              title={group.title}
              items={group.items}
              onPress={handleMenuPress}
            />
          ))}

          <Text style={styles.version}>v 1.0.2 · 열린문 커넥트</Text>
        </ScrollView>

        <ConfirmDialog
          visible={showLogoutConfirm}
          title="로그아웃 하시겠어요?"
          cancelText="취소"
          confirmText="로그아웃"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      </View>
    </Screen>
  );
}

function MenuSection({
  title,
  items,
  onPress,
}: {
  title: string;
  items: MenuItem[];
  onPress: (item: MenuItem) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.menuCard}>
        {items.map((item, index) => (
          <MenuRow
            key={item.label}
            item={item}
            last={index === items.length - 1}
            onPress={() => onPress(item)}
          />
        ))}
      </Card>
    </View>
  );
}

function MenuRow({
  item,
  last,
  onPress,
}: {
  item: MenuItem;
  last: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={item.action === "logout" ? "mypage-logout" : undefined}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.menuRow, last ? styles.menuRowLast : null]}
    >
      <AppIcon name={item.icon} size={20} color={theme.colors.textMuted} />
      <Text style={styles.menuLabel}>{item.label}</Text>
      {item.meta ? <Text style={styles.menuMeta}>{item.meta}</Text> : null}
      <AppIcon
        name="chevron-right"
        size={20}
        color={theme.colors.borderStrong}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing["2"],
    paddingBottom: theme.spacing["8"],
    gap: theme.spacing["5"],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["4"],
    paddingLeft: theme.spacing["5"],
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.heading.fontSize,
    lineHeight: theme.typography.heading.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  church: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  editHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  editText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    gap: theme.spacing["2"],
  },
  sectionTitle: {
    paddingHorizontal: theme.spacing["1"],
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  menuCard: {
    overflow: "hidden",
    padding: 0,
  },
  menuRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["4"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing["5"],
    paddingVertical: theme.spacing["4"],
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.medium,
  },
  menuMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  version: {
    paddingVertical: theme.spacing["1"],
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
