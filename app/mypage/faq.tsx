import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import { FaqItem } from "../../src/components/mypage/FaqItem";
import { StaggerItem } from "../../src/components/mypage/StaggerItem";
import {
  Card,
  Empty,
  ErrorState,
  FilterChips,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useFaqs } from "../../src/hooks/useSiteContent";
import { readDesignVariant } from "../../src/lib/designVariant";

export default function FaqScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const empty = readDesignVariant(params.designVariant) === "empty";
  const { data: faqCategories, isLoading, isError, refetch } = useFaqs();

  const [selectedCategory, setSelectedCategory] = useState("전체");

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
              "지금은 등록된 질문이 없어요.\n궁금한 점은 교회 사무실로 문의해 주세요."
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            {categories.length > 0 ? (
              <FilterChips
                items={categories.map((category) => ({
                  key: category,
                  label: category,
                }))}
                active={selectedCategory}
                onChange={setSelectedCategory}
                style={styles.chipsScroll}
                testIDPrefix="faq-category"
              />
            ) : null}

            {activeFaqs.length === 0 ? (
              <Empty
                icon="help-outline"
                title="등록된 질문이 없어요"
                description="이 카테고리에는 아직 질문이 없어요."
              />
            ) : (
              activeFaqs.map((faq, index) => (
                <StaggerItem key={`${faq.id}-${faq.question}`} index={index}>
                  <FaqItem
                    question={faq.question}
                    answer={faq.answer}
                    style={styles.faqRow}
                  />
                </StaggerItem>
              ))
            )}

            <Card style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <AppIcon
                  name="help-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>찾는 답이 없나요?</Text>
                <Text style={styles.contactDesc}>
                  교회 사무실로 문의해 주세요.
                </Text>
              </View>
            </Card>
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
    paddingBottom: theme.spacing["8"],
  },
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    paddingTop: theme.spacing["2"],
    paddingBottom: theme.spacing["3"],
  },
  faqRow: {
    marginHorizontal: theme.layout.screenX,
  },
  contactCard: {
    marginTop: theme.spacing["6"],
    marginHorizontal: theme.layout.screenX,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  contactDesc: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
