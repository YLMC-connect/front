import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Empty, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useFaqs } from "../../../src/hooks/useSiteContent";
import { readDesignVariant } from "../../../src/lib/designVariant";

const fallbackCategories = [
  "전체",
  "계정",
  "중고·나눔",
  "소모임",
  "기도",
  "삶공부",
];

const fallbackFaqs = [
  {
    id: 1,
    question: "회원가입은 어떻게 하나요?",
    answer:
      "로그인 화면에서 회원가입을 선택한 뒤 약관 동의와 기본 정보를 입력하면 가입할 수 있습니다.",
  },
  { id: 2, question: "비밀번호는 어디서 변경하나요?", answer: "" },
  { id: 3, question: "중고거래 시 가격은 어떻게 정하나요?", answer: "" },
  { id: 4, question: "소모임을 직접 만들고 싶어요", answer: "" },
  { id: 5, question: "기도방은 어떻게 신청하나요?", answer: "" },
  { id: 6, question: "수강 신청 후 취소하려면?", answer: "" },
  { id: 7, question: "알림이 너무 자주 와요", answer: "" },
  { id: 8, question: "탈퇴하면 데이터는 어떻게 되나요?", answer: "" },
];

export default function FaqScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const empty = readDesignVariant(params.designVariant) === "empty";
  const { data: faqCategories } = useFaqs();

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    "회원가입은 어떻게 하나요?": true,
  });

  const categories = useMemo(() => {
    if (faqCategories && faqCategories.length > 0) {
      return ["전체", ...faqCategories.map((c) => c.name)];
    }
    return fallbackCategories;
  }, [faqCategories]);

  const activeFaqs = useMemo(() => {
    if (faqCategories && faqCategories.length > 0) {
      if (selectedCategory === "전체") {
        return faqCategories.flatMap((c) => c.faqs);
      }
      return faqCategories.find((c) => c.name === selectedCategory)?.faqs ?? [];
    }
    return fallbackFaqs;
  }, [faqCategories, selectedCategory]);

  const toggleFaq = (key: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="자주 묻는 질문" back onBack={() => router.back()} />
        {empty ? (
          <View style={styles.emptyWrap}>
            <Empty
              icon="help-outline"
              title="등록된 FAQ가 없어요"
              description={
                "지금은 등록된 질문이 없어요.\n궁금한 점은 1:1 문의로 연락주세요."
              }
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((category) => {
                const isSelected = category === selectedCategory;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="button"
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.chip, isSelected ? styles.chipOn : null]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextOn : null,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {activeFaqs.map((faq) => {
              const isOpen = Boolean(openMap[faq.question]);
              return (
                <View key={faq.question} style={styles.faqRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => toggleFaq(faq.question)}
                    style={styles.questionRow}
                  >
                    <View style={styles.qMark}>
                      <Text style={styles.qText}>Q</Text>
                    </View>
                    <Text style={styles.question}>{faq.question}</Text>
                    <AppIcon
                      name="chevron-right"
                      size={18}
                      color={theme.colors.inkMute}
                      style={isOpen ? styles.chevronOpen : null}
                    />
                  </Pressable>
                  {isOpen && faq.answer ? (
                    <Text style={styles.answer}>{faq.answer}</Text>
                  ) : null}
                </View>
              );
            })}
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
    paddingBottom: 20,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: {
    borderColor: "transparent",
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  faqRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  qMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  question: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
    fontWeight: theme.fontWeight.semibold,
  },
  chevronOpen: {
    transform: [{ rotate: "90deg" }],
  },
  answer: {
    marginTop: 10,
    marginLeft: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: 12,
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 22,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
});
