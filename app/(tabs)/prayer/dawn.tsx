import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  AppText,
  ErrorState,
  ListSkeleton,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useDawnPrayerDetail } from "../../../src/hooks/useHome";

export default function DawnPrayerScreen() {
  const detail = useDawnPrayerDetail();

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
          <AppText variant="caption" tone="muted">
            {detail.data.timeLabel}
          </AppText>
          <AppText variant="display" style={styles.title}>
            {detail.data.title}
          </AppText>
          <AppText variant="body" tone="secondary" style={styles.summary}>
            {detail.data.summary}
          </AppText>
          <View style={styles.panel}>
            <AppText variant="body" style={styles.bodyText}>
              {detail.data.body}
            </AppText>
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
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[10],
    gap: theme.spacing[2],
  },
  title: {
    marginTop: theme.spacing[1],
  },
  summary: {
    marginBottom: theme.spacing[4],
  },
  panel: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: theme.layout.cardPadding + 4,
  },
  bodyText: {
    lineHeight: theme.lineHeight.lg + 4,
  },
});
