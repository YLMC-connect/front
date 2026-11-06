import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../layout/Screen";
import { Empty, TopBar } from "../ui";
import { theme } from "../../constants/theme";
import { useActiveSitePolicy } from "../../hooks/useSiteContent";
import type { SitePolicyType } from "../../types/siteContentApi";

export function LegalDocumentScreen({
  title = "이용약관",
  policyType,
}: {
  title?: string;
  primary?: string;
  policyType?: SitePolicyType;
}) {
  const router = useRouter();
  const resolvedType: SitePolicyType =
    policyType ?? (title.includes("개인정보") ? 2 : 1);
  const { data: policy, isLoading } = useActiveSitePolicy(resolvedType);

  const formatEnforcedAt = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return `시행일자: ${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
      // 의도된 무시: 시행일자는 보조 정보라 형식이 이상하면 표시만 생략한다.
      return null;
    }
  };

  const effectiveDateText = formatEnforcedAt(policy?.enforcedAt);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={policy?.title || title}
          back
          onBack={() => router.back()}
        />
        {isLoading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : !policy?.content ? (
          <Empty
            icon="help-outline"
            title={
              resolvedType === 2
                ? "등록된 개인정보 처리방침이 없어요"
                : "등록된 약관이 없어요"
            }
            description={
              resolvedType === 2
                ? "현재 등록된 개인정보 처리방침 내용이 없습니다."
                : "현재 등록된 약관 내용이 없습니다."
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            {effectiveDateText ? (
              <Text style={styles.effective}>{effectiveDateText}</Text>
            ) : null}
            <View style={styles.section}>
              <Text style={styles.text}>{policy.content}</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 24,
  },
  effective: {
    marginBottom: 18,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  section: {
    marginBottom: 22,
  },
  heading: {
    marginBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  text: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 23.5,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
