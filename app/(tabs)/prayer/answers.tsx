import { useRouter } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  EmptyMessage,
  PrayerItem,
  toAnswerItem,
} from "../../../src/components/prayer/detail/PrayerDetailParts";
import {
  ErrorState,
  LoadMoreFooter,
  Skeleton,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { usePrayerAnswers } from "../../../src/hooks/usePrayers";

/** 응답완료된 기도제목 전체(최신순). 기도방 상세 응답 탭의 "응답 전체 보기" 에서 연다. */
export default function PrayerAnswersScreen() {
  const router = useRouter();
  const answers = usePrayerAnswers();

  const body = answers.isPending ? (
    <View style={styles.list} testID="prayer-answers-skeleton">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} width="100%" height={132} />
      ))}
    </View>
  ) : answers.isError ? (
    <ErrorState
      message="기도 응답을 불러오지 못했어요."
      onRetry={() => void answers.refetch()}
    />
  ) : (
    <FlatList
      testID="prayer-answers-list"
      data={answers.items}
      keyExtractor={(topic) => String(topic.id)}
      renderItem={({ item }) => <PrayerItem item={toAnswerItem(item)} answer />}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={answers.isRefetching && !answers.isFetchingNextPage}
          onRefresh={() => void answers.refetch()}
          tintColor={theme.colors.primary}
        />
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (answers.hasNextPage && !answers.isFetchingNextPage) {
          void answers.fetchNextPage();
        }
      }}
      ListEmptyComponent={
        <EmptyMessage
          icon="check-circle"
          title="응답완료된 기도제목이 없어요"
          desc="응답완료된 기도제목이 최신순으로 여기에 보여요."
        />
      }
      ListFooterComponent={
        answers.items.length > 0 ? (
          <LoadMoreFooter
            state={
              answers.isFetchingNextPage
                ? "loading"
                : answers.isFetchNextPageError
                  ? "error"
                  : answers.hasNextPage
                    ? "idle"
                    : "end"
            }
            onRetry={() => void answers.fetchNextPage()}
            testID="prayer-answers-load-more"
          />
        ) : null
      }
    />
  );

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="기도 응답" back onBack={() => router.back()} />
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing[3],
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[10],
  },
});
