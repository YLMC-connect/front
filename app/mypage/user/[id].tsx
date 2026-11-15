import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import { TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

type Variant = "default" | "withdrawn";

function variantOf(value: string | string[] | undefined): Variant {
  const variant = Array.isArray(value) ? value[0] : value;
  return variant === "withdrawn" ? variant : "default";
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = variantOf(readDesignVariant(params.designVariant));
  const isWithdrawn = variant === "withdrawn";
  const name = isWithdrawn ? "알 수 없음" : "박정아";
  const initial = isWithdrawn ? "?" : "정아";

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="프로필" back onBack={() => router.back()} />
        <View style={styles.body}>
          <View style={styles.profileBlock}>
            <View
              style={[
                styles.avatar,
                isWithdrawn ? styles.avatarWithdrawn : null,
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  isWithdrawn ? styles.avatarTextWithdrawn : null,
                ]}
              >
                {initial}
              </Text>
            </View>
            <Text
              style={[styles.name, isWithdrawn ? styles.nameWithdrawn : null]}
            >
              {name}
            </Text>
            {isWithdrawn ? (
              <Text style={styles.withdrawnText}>탈퇴한 사용자</Text>
            ) : null}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 24,
  },
  profileBlock: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.md,
  },
  avatarWithdrawn: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  avatarText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  avatarTextWithdrawn: {
    color: theme.colors.textMuted,
  },
  name: {
    marginTop: 18,
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  nameWithdrawn: {
    color: theme.colors.textMuted,
  },
  withdrawnText: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
