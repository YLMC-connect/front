import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { Empty, ErrorState, TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useFaqs } from "../../src/hooks/useSiteContent";
import { readDesignVariant } from "../../src/lib/designVariant";

export default function FaqScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const empty = readDesignVariant(params.designVariant) === "empty";
  const { data: faqCategories, isLoading, isError, refetch } = useFaqs();

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    if (faqCategories && faqCategories.length > 0) {
      return ["전체", ...faqCategories.map((c) => c.name)];
    }
    return [];
  }, [faqCategories]);

  const activeFaqs = useMemo(() => {
    if (!faqCategories || faqCategories.length === 0) {
      return [];
    }
    if (selectedCategory === "전체") {
      return faqCategories.flatMap((c) => c.faqs);
    }
    return faqCategories.find((c) => c.name === selectedCategory)?.faqs ?? [];
  }, [faqCategories, selectedCategory]);

  const toggleFaq = (key: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isTotalEmpty =
    empty || (!isLoading && (!faqCategories || faqCategories.length === 0));

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="자주 묻는 질문" back onBack={() => router.back()} />
        {isLoading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError && !faqCategories ? (
          <ErrorState
            message="자주 묻는 질문을 불러오지 못했어요. 다시 시도해주세요."
            onRetry={() => void refetch()}
          />
        ) : isTotalEmpty ? (
          <Empty
            icon="help-outline"
            title="등록된 FAQ가 없어요"
            description={
              "지금은 등록된 질문이 없어요.\n궁금한 점은 1:1 문의로 연락주세요."
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            {categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
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
            ) : null}

            {activeFaqs.length === 0 ? (
              <Empty
                icon="help-outline"
                title="등록된 질문이 없어요"
                description="해당 카테고리에 등록된 질문이 없습니다."
              />
            ) : (
              activeFaqs.map((faq) => {
                const isOpen = Boolean(openMap[faq.question]);
                return (
                  <View key={`${faq.id}-${faq.question}`} style={styles.faqRow}>
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
              })
            )}
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.full,
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
  },
});
