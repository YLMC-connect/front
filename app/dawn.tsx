import { AppIcon } from "@/components/ui/app-icon";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../src/components/layout/Screen";
import {
  AppText,
  ErrorState,
  ListSkeleton,
  TopBar,
} from "../src/components/ui";
import { theme } from "../src/constants/theme";
import { useDawnPrayerDetail } from "../src/hooks/useHome";

function splitReaderParagraphs(body: string): string[] {
  if (!body) return [];
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph) => !/^본문(\s*말씀)?\s*:/i.test(paragraph));
}

export default function DawnPrayerScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const detail = useDawnPrayerDetail(params.id);
  const paragraphs = splitReaderParagraphs(detail.data?.body ?? "");

  return (
    <Screen scroll={false} padded={false} testID="screen-dawn-prayer">
      <TopBar
        title="새벽기도 말씀요약"
        back
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace("/");
        }}
      />
      {detail.isPending ? (
        <View style={styles.loading}>
          <ListSkeleton rows={3} />
        </View>
      ) : detail.isError || !detail.data ? (
        <View style={styles.errorWrap}>
          <ErrorState
            message="새벽기도 말씀요약을 불러오지 못했습니다."
            onRetry={() => detail.refetch()}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroDateBadge}>
                <AppIcon
                  name="book-open-page-variant-outline"
                  size={15}
                  color={theme.colors.primaryDeep}
                />
                <AppText
                  variant="formLabel"
                  tone="brand"
                  style={styles.heroDateText}
                >
                  {detail.data.fullDateLabel ||
                    detail.data.dateLabel ||
                    detail.data.timeLabel}
                </AppText>
              </View>
            </View>
            <AppText variant="screenTitle" style={styles.title}>
              {detail.data.title}
            </AppText>
          </View>

          <View style={styles.panel}>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <AppText
                  key={`${index}-${paragraph.slice(0, 16)}`}
                  variant="body"
                  style={styles.bodyText}
                >
                  {paragraph}
                </AppText>
              ))
            ) : (
              <AppText variant="body" tone="muted" style={styles.bodyText}>
                등록된 본문 내용이 없습니다.
              </AppText>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
  },
  errorWrap: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[6],
  },
  body: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[10],
    gap: theme.spacing[3],
  },
  heroCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
  },
  heroDateText: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primaryDeep,
  },
  title: {
    marginTop: 2,
    color: theme.colors.ink,
  },
  panel: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[5],
    gap: theme.spacing[4],
  },
  bodyText: {
    fontSize: theme.fontSize.lg,
    lineHeight: 27,
    color: theme.colors.ink,
  },
});
