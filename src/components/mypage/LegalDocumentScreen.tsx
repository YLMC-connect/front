import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../layout/Screen";
import { Empty, ErrorState, TopBar, UnderlineTabs } from "../ui";
import { theme } from "../../constants/theme";
import { useActiveSitePolicy } from "../../hooks/useSiteContent";
import type { SitePolicyType } from "../../types/siteContentApi";

export type LegalTab = "terms" | "privacy";

const tabs: readonly { key: LegalTab; label: string }[] = [
  { key: "terms", label: "이용약관" },
  { key: "privacy", label: "개인정보 처리방침" },
];

const POLICY_TYPE: Record<LegalTab, SitePolicyType> = {
  terms: 1,
  privacy: 2,
};

const COPY: Record<LegalTab, { error: string; empty: string }> = {
  terms: {
    error: "약관을 불러오지 못했어요. 다시 시도해 주세요.",
    empty: "등록된 약관이 없어요",
  },
  privacy: {
    error: "개인정보 처리방침을 불러오지 못했어요. 다시 시도해 주세요.",
    empty: "등록된 개인정보 처리방침이 없어요",
  },
};

function formatEnforcedAt(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  // 시행일은 보조 정보라 형식이 이상하면 표시만 생략한다.
  if (isNaN(d.getTime())) return null;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `시행일 ${d.getFullYear()}.${mm}.${dd}`;
}

/** 약관 · 정책: 이용약관과 개인정보 처리방침을 탭으로 오간다. */
export function LegalDocumentScreen({
  initialTab = "terms",
}: {
  initialTab?: LegalTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<LegalTab>(initialTab);
  const {
    data: policy,
    isLoading,
    isError,
    refetch,
  } = useActiveSitePolicy(POLICY_TYPE[tab]);

  const effectiveDateText = formatEnforcedAt(policy?.enforcedAt);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="약관 · 정책" back onBack={() => router.back()} />
        <UnderlineTabs
          items={tabs}
          active={tab}
          onChange={setTab}
          testIDPrefix="legal-tabs"
        />
        {isLoading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError && !policy ? (
          <ErrorState
            message={COPY[tab].error}
            onRetry={() => void refetch()}
          />
        ) : !policy?.content ? (
          <Empty icon="description" title={COPY[tab].empty} />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            {effectiveDateText ? (
              <Text style={styles.effective}>{effectiveDateText}</Text>
            ) : null}
            {policy.title ? (
              <Text style={styles.heading}>{policy.title}</Text>
            ) : null}
            <Text style={styles.text}>{policy.content}</Text>
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
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing["4"],
    paddingBottom: theme.spacing["8"],
  },
  effective: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  heading: {
    marginTop: theme.spacing["5"],
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  text: {
    marginTop: theme.spacing["2"],
    color: theme.colors.neutral700,
    fontSize: theme.typography.label.fontSize,
    lineHeight: 22,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
