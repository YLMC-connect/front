import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { StaggerItem } from "../../src/components/mypage/StaggerItem";
import {
  Empty,
  ErrorState,
  FilterChips,
  TopBar,
} from "../../src/components/ui";
import { Accordion } from "../../src/components/ui/accordion";
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
              "지금은 등록된 질문이 없어요.\n궁금한 점은 1:1 문의로 연락주세요."
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
                description="해당 카테고리에 등록된 질문이 없습니다."
              />
            ) : (
              activeFaqs.map((faq, index) => (
                <StaggerItem key={`${faq.id}-${faq.question}`} index={index}>
                  <Accordion title={faq.question} style={styles.faqRow}>
                    {faq.answer}
                  </Accordion>
                </StaggerItem>
              ))
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
    paddingTop: 4,
  },
  faqRow: {
    marginHorizontal: theme.layout.screenX,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
