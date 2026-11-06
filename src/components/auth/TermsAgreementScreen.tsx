import { AppIcon } from "@/components/ui/app-icon";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  SlideInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { Screen } from "../layout/Screen";
import {
  ErrorState,
  FLOATING_BOTTOM_BAR_INSET,
  FloatingBottomBar,
  TopBar,
} from "../ui";
import { theme } from "../../constants/theme";
import { useActiveSitePolicy } from "../../hooks/useSiteContent";
import type { SitePolicyType } from "../../types/siteContentApi";

export type TermKey = "tos" | "privacy" | "loc" | "mkt";

const terms = [
  { key: "tos", label: "서비스 이용약관", required: true },
  { key: "privacy", label: "개인정보 처리방침", required: true },
  { key: "loc", label: "위치 기반 서비스 이용약관", required: false },
  { key: "mkt", label: "마케팅 정보 수신 동의", required: false },
] as const;

const optionalTermsText: Partial<
  Record<TermKey, { title: string; body: string }>
> = {
  loc: {
    title: "위치 기반 서비스 이용약관",
    body: `제1조 (목적)
본 약관은 회사가 제공하는 위치기반서비스 이용과 관련된 사항을 규정합니다.

제2조 (위치정보 이용·제공)
회원의 사전 동의 없이 개인 위치정보를 제3자에게 제공하지 않습니다.`,
  },
  mkt: {
    title: "마케팅 정보 수신 동의",
    body: "회사가 제공하는 서비스 안내, 이벤트, 신규 기능 등의 마케팅 정보를 푸시 알림 및 이메일로 수신하는 데 동의합니다. 본 동의는 선택 사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.",
  },
};

export function TermsAgreementScreen({
  initialSheet = null,
}: {
  initialSheet?: TermKey | null;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({
    tos: false,
    privacy: false,
    loc: false,
    mkt: false,
  });
  const [sheet, setSheet] = useState<TermKey | null>(initialSheet);
  const allOn = terms.every((term) => agreed[term.key]);
  const requiredOn = terms
    .filter((term) => term.required)
    .every((term) => agreed[term.key]);

  const toggleAll = () => {
    const next = !allOn;
    setAgreed({ tos: next, privacy: next, loc: next, mkt: next });
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="서비스 이용 동의" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.display}>약관에 동의해주세요</Text>
          <Text style={styles.description}>
            서비스 이용을 위해 약관 동의가 필요해요.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={toggleAll}
            style={[styles.allRow, allOn ? styles.allRowOn : null]}
          >
            <CheckCircle on={allOn} big />
            <Text style={styles.allText}>전체 동의하기</Text>
          </Pressable>

          <View style={styles.list}>
            {terms.map((term) => (
              <View key={term.key} style={styles.row}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${term.required ? "필수" : "선택"} ${term.label} 동의`}
                  accessibilityState={{ checked: agreed[term.key] }}
                  onPress={() =>
                    setAgreed((current) => ({
                      ...current,
                      [term.key]: !current[term.key],
                    }))
                  }
                >
                  <CheckCircle on={agreed[term.key]} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    setAgreed((current) => ({
                      ...current,
                      [term.key]: !current[term.key],
                    }))
                  }
                  style={styles.rowLabelWrap}
                >
                  <Text style={styles.rowLabel}>
                    <Text
                      style={term.required ? styles.required : styles.optional}
                    >
                      [{term.required ? "필수" : "선택"}]
                    </Text>{" "}
                    {term.label}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    Keyboard.dismiss();
                    setSheet(term.key);
                  }}
                  style={styles.detailButton}
                >
                  <Text style={styles.detailText}>전문 보기</Text>
                  <AppIcon
                    name="chevron-right"
                    size={16}
                    color={theme.colors.text}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>

        <FloatingBottomBar
          label="다음"
          disabled={!requiredOn}
          onPress={() => router.back()}
          testID="terms-submit"
        />

        <TermsSheet termKey={sheet} onClose={() => setSheet(null)} />
      </View>
    </Screen>
  );
}

function CheckCircle({ on, big = false }: { on: boolean; big?: boolean }) {
  const size = big ? 24 : 20;

  return (
    <View
      style={[
        styles.check,
        { width: size, height: size, borderRadius: size / 2 },
        on ? styles.checkOn : null,
      ]}
    >
      {on ? (
        <AppIcon
          name="check"
          size={size * 0.66}
          color={theme.colors.onPrimary}
        />
      ) : null}
    </View>
  );
}

export function TermsSheet({
  termKey,
  onClose,
}: {
  termKey: TermKey | null;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (termKey) {
      Keyboard.dismiss();
    }
  }, [termKey]);

  const resolvedPolicyType: SitePolicyType | null =
    termKey === "tos" ? 1 : termKey === "privacy" ? 2 : null;

  const {
    data: policy,
    isLoading,
    isError,
    refetch,
  } = useActiveSitePolicy(resolvedPolicyType, {
    enabled: resolvedPolicyType != null,
  });

  if (!termKey) return null;

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

  const defaultTitle =
    termKey === "tos"
      ? "서비스 이용약관"
      : termKey === "privacy"
        ? "개인정보 처리방침"
        : (optionalTermsText[termKey]?.title ?? "약관");

  const sheetTitle = policy?.title || defaultTitle;
  const effectiveDateText = formatEnforcedAt(policy?.enforcedAt);
  const sheetContent =
    policy?.content ?? optionalTermsText[termKey]?.body ?? "";

  return (
    <View style={styles.sheetLayer}>
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(260)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable
          style={styles.sheetDim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="배경 닫기"
        />
      </Animated.View>
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : SlideInDown.duration(320).easing(Easing.out(Easing.cubic))
        }
        style={styles.sheet}
      >
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{sheetTitle}</Text>
          <Pressable
            accessibilityLabel="닫기"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <AppIcon name="close" size={18} color={theme.colors.text} />
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
        {isLoading ? (
          <View style={styles.sheetLoadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError && !policy ? (
          <ErrorState
            message="약관을 불러오지 못했어요. 다시 시도해주세요."
            onRetry={() => void refetch()}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.sheetBody}>
            {effectiveDateText ? (
              <Text style={styles.effectiveDate}>{effectiveDateText}</Text>
            ) : null}
            <Text style={styles.fullText}>
              {sheetContent || "등록된 약관 내용이 없습니다."}
            </Text>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: 24,
    paddingBottom: FLOATING_BOTTOM_BAR_INSET,
  },
  display: {
    color: theme.colors.text,
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  description: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  allRow: {
    marginTop: 28,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  allRowOn: {
    backgroundColor: theme.colors.primarySubtle,
  },
  allText: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  list: {
    marginTop: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabelWrap: {
    flex: 1,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  required: {
    color: theme.colors.primaryStrong,
    fontWeight: theme.fontWeight.semibold,
  },
  optional: {
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.semibold,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    textDecorationLine: "underline",
  },
  check: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
  },
  checkOn: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    justifyContent: "flex-end",
  },
  sheetDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.sheetOverlay,
  },
  sheet: {
    height: "90%",
    maxHeight: "90%",
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    backgroundColor: theme.colors.bg,
    ...theme.shadow.sheet,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  closeButton: {
    minWidth: 64,
    height: theme.layout.touchTarget,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.surface,
  },
  closeText: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  effectiveDate: {
    marginBottom: 10,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  fullText: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  sheetLoadingWrap: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
