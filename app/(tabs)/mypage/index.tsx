import { AppIcon } from "@/components/ui/app-icon";
import { useRouter, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../../../src/components/layout/Screen";
import { Avatar, Card, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useAuth } from "../../../src/hooks/useAuth";

type IconName = ComponentProps<typeof AppIcon>["name"];

type MenuItem = {
  label: string;
  icon: IconName;
  href?: Href;
  action?: "logout";
  danger?: boolean;
};

const activityItems: MenuItem[] = [
  { label: "내 활동", icon: "history", href: "/mypage/activity" },
  {
    label: "중보기도 활동 이력",
    icon: "hands-pray",
    href: "/mypage/activity?tab=prayer",
  },
  {
    label: "삶공부 수료",
    icon: "menu-book",
    href: "/life-study/history",
  },
  { label: "차단 관리", icon: "block", href: "/mypage/blocked" },
];

const supportItems: MenuItem[] = [
  { label: "FAQ", icon: "help-outline", href: "/mypage/faq" },
  { label: "약관", icon: "description", href: "/mypage/terms" },
  {
    label: "개인정보 처리방침",
    icon: "verified-user",
    href: "/mypage/privacy",
  },
];

const accountItems: MenuItem[] = [
  { label: "로그아웃", icon: "logout", action: "logout" },
];

const manageItems: MenuItem[] = [
  {
    label: "회원탈퇴",
    icon: "person-remove",
    href: "/mypage/withdraw",
    danger: true,
  },
];

export default function MyPageScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleMenuPress = async (item: MenuItem) => {
    if (item.action === "logout") {
      try {
        await logout();
      } catch {
        // The in-memory session is cleared even if native token deletion fails.
      } finally {
        router.replace("/login");
      }
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Screen>
      <TopBar title="마이페이지" back onBack={() => router.back()} />

      <Card style={styles.profileCard}>
        <Avatar name="김은혜" size={60} seed="김은혜" />
        <View style={styles.profileText}>
          <Text style={styles.name}>김은혜</Text>
          <Text style={styles.church}>열린문교회</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/mypage/edit")}
          style={styles.editButton}
        >
          <Text style={styles.editText}>프로필 수정</Text>
        </Pressable>
      </Card>

      <MenuSection
        title="활동 관리"
        items={activityItems}
        onPress={handleMenuPress}
      />
      <MenuSection
        title="고객센터"
        items={supportItems}
        onPress={handleMenuPress}
      />
      <MenuSection
        title="계정"
        items={accountItems}
        onPress={handleMenuPress}
      />
      <MenuSection
        title="계정 관리"
        items={manageItems}
        onPress={handleMenuPress}
      />

      <Text style={styles.version}>v 1.0.2 · 열린문 커넥트</Text>
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
  onPress: (item: MenuItem) => void | Promise<void>;
}) {
  return (
    <Section title={title}>
      <Card style={styles.menuCard}>
        {items.map((item, index) => (
          <MenuRow
            key={item.label}
            item={item}
            last={index === items.length - 1}
            onPress={() => void onPress(item)}
          />
        ))}
      </Card>
    </Section>
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
  const color = item.danger ? theme.colors.danger : theme.colors.inkSoft;

  return (
    <Pressable
      testID={item.action === "logout" ? "mypage-logout" : undefined}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.menuRow, last ? styles.menuRowLast : null]}
    >
      <AppIcon name={item.icon} size={20} color={color} />
      <Text style={[styles.menuLabel, item.danger ? styles.dangerText : null]}>
        {item.label}
      </Text>
      <AppIcon name="chevron-right" size={20} color={theme.colors.inkHint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: theme.fontWeight.bold,
  },
  church: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  editButton: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  editText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
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
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.medium,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  version: {
    paddingTop: 8,
    paddingBottom: 8,
    textAlign: "center",
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
  },
});
