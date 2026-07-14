import { AppIcon } from "@/components/ui/app-icon";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../layout/Screen";
import { TopBar } from "../ui";
import { theme } from "../../constants/theme";

type TermKey = "tos" | "privacy" | "loc" | "mkt";

const terms = [
  { key: "tos", label: "서비스 이용약관", required: true },
  { key: "privacy", label: "개인정보 처리방침", required: true },
  { key: "loc", label: "위치 기반 서비스 이용약관", required: false },
  { key: "mkt", label: "마케팅 정보 수신 동의", required: false },
] as const;

const fullText: Record<TermKey, { title: string; body: string }> = {
  tos: {
    title: "서비스 이용약관",
    body: `제1조 (목적)
본 약관은 열린문커넥트(이하 "서비스")가 제공하는 모바일 애플리케이션 및 관련 제반 서비스의 이용과 관련하여 회사와 회원의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
2. "콘텐츠"란 회원이 서비스에 게시한 글, 사진, 댓글 등을 의미합니다.
3. "교회 커뮤니티"란 동일 교회 소속 회원으로 구성된 폐쇄형 그룹을 말합니다.

제3조 (약관의 효력 및 변경)
본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.`,
  },
  privacy: {
    title: "개인정보 처리방침",
    body: `제1조 (수집하는 개인정보 항목)
회사는 회원가입, 서비스 제공 및 상담 등을 위해 아래와 같은 개인정보를 수집합니다.
- 필수: 아이디, 비밀번호, 이름, 연락처
- 선택: 목장/부서 정보

제2조 (개인정보의 수집 및 이용 목적)
회원 관리, 서비스 제공, 부정 이용 방지, 통계 분석을 위해 사용됩니다.`,
  },
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
        <TopBar title="서비스 이용 동의" back={false} />
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
                  onPress={() => setSheet(term.key)}
                  style={styles.detailButton}
                >
                  <Text style={styles.detailText}>전문 보기</Text>
                  <AppIcon
                    name="chevron-right"
                    size={16}
                    color={theme.colors.inkSoft}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomFlat}>
          <Pressable
            accessibilityRole="button"
            disabled={!requiredOn}
            style={[
              styles.nextButton,
              !requiredOn ? styles.nextDisabled : null,
            ]}
          >
            <Text style={styles.nextText}>다음</Text>
          </Pressable>
        </View>

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
      {on ? <AppIcon name="check" size={size * 0.66} color="#fff" /> : null}
    </View>
  );
}

function TermsSheet({
  termKey,
  onClose,
}: {
  termKey: TermKey | null;
  onClose: () => void;
}) {
  if (!termKey) return null;
  const term = fullText[termKey];

  return (
    <View style={styles.sheetLayer}>
      <Pressable style={styles.sheetDim} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{term.title}</Text>
          <Pressable
            accessibilityLabel="close"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <AppIcon name="close" size={18} color={theme.colors.inkSoft} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.sheetBody}>
          <Text style={styles.effectiveDate}>시행일자: 2026년 1월 1일</Text>
          <Text style={styles.fullText}>{term.body}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  display: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: "900",
  },
  description: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.base,
    lineHeight: theme.lineHeight.body,
  },
  allRow: {
    marginTop: 28,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  allRowOn: {
    backgroundColor: theme.colors.primaryTint,
  },
  allText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.md,
  },
  required: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.semibold,
  },
  optional: {
    color: theme.colors.inkMute,
    fontWeight: theme.fontWeight.semibold,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    textDecorationLine: "underline",
  },
  check: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
  },
  checkOn: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  bottomFlat: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  nextButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  nextDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: "flex-end",
  },
  sheetDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.sheetOverlay,
  },
  sheet: {
    maxHeight: "80%",
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
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
    backgroundColor: theme.colors.lineStrong,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  effectiveDate: {
    marginBottom: 10,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  fullText: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 24,
  },
});
