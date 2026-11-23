import { AppIcon } from "@/components/ui/app-icon";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useIsFocused, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Text, TextInput } from "@/components/ui/text";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "../../../src/components/layout/Screen";
import {
  AppText,
  Avatar,
  Badge,
  ConfirmDialog,
  RadioSheet,
  DetailAction,
  ErrorState,
  ImageViewer,
  MotionPressable,
  PlaceCard,
  Skeleton,
  TopBar,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useCreateMarketComment,
  useDeleteMarketComment,
  useDeleteMarketPost,
  useMarketCategories,
  useMarketDetail,
  useUpdateMarketStatus,
  useUpdateMarketComment,
} from "../../../src/hooks/useMarket";
import type {
  MarketDetailComment,
  MarketStatus,
} from "../../../src/types/market";
import {
  CarouselDot,
  CarouselSlide,
  CenterBadge,
  CommentsSection,
  StatusBanner,
} from "../../../src/components/market/detail/MarketDetailParts";
import { styles } from "../../../src/components/market/detail/marketDetailStyles";

const STATUS_OPTIONS: readonly {
  value: MarketStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "sharing",
    label: "나눔중",
    description: "누구나 댓글로 신청할 수 있어요",
  },
  { value: "reserved", label: "예약중", description: "받을 분이 정해졌어요" },
  { value: "done", label: "나눔완료", description: "나눔이 끝났어요" },
];

export default function MarketDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? "1";
  const detail = useMarketDetail(id);
  const categories = useMarketCategories();
  const createComment = useCreateMarketComment(id);
  const updateComment = useUpdateMarketComment(id);
  const deleteComment = useDeleteMarketComment(id);
  const deletePost = useDeleteMarketPost(id);
  const updateStatus = useUpdateMarketStatus(id);
  // 상태 변경 시트에서 고른 값. null 이면 시트가 닫혀 있다.
  const [statusDraft, setStatusDraft] = useState<MarketStatus | null>(null);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isPastHero, setIsPastHero] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const scrollX = useSharedValue(0);
  const onHeroScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });
  const heroThreshold = Math.max(width - (insets.top + 56), 1);
  const headerTint = isPastHero ? theme.colors.text : theme.colors.onPrimary;
  const isFocused = useIsFocused();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const past = offsetY >= heroThreshold;
    if (past !== isPastHero) {
      setIsPastHero(past);
    }
  };

  if (detail.isPending) {
    return (
      <Screen padded={false} applyTopInset={false}>
        <View style={styles.loading}>
          <Skeleton width="100%" height={360} radius={0} />
          <View style={styles.loadingBody}>
            <Skeleton width="45%" height={18} />
            <Skeleton width="88%" height={24} />
            <Skeleton width="100%" height={80} />
          </View>
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen padded={false} scroll={false} testID="screen-market-detail-error">
        <View style={styles.root}>
          <TopBar title="나눔 상세" back onBack={() => router.back()} />
          <View
            style={styles.centeredError}
            testID="market-detail-error-center"
          >
            <ErrorState
              message="나눔 정보를 다시 불러와주세요."
              onRetry={() => detail.refetch()}
            />
          </View>
        </View>
      </Screen>
    );
  }

  const market = detail.data;
  // 이름은 서버 카테고리 목록에서 찾는다. 목록을 못 받으면 배지를 숨긴다
  const categoryName = market
    ? categories.data?.find((item) => item.code === market.categoryCode)?.name
    : undefined;
  const isOwn = market.isMine;
  const status = market.status;
  const isReserved = status === "reserved";
  const isDone = status === "done";
  const authorName = market.authorName;
  const isCommentPending = createComment.isPending || updateComment.isPending;
  const resetCommentComposer = () => {
    setComment("");
    setEditingCommentId(null);
  };
  const onSubmitComment = () => {
    if (!comment.trim()) return;
    if (editingCommentId) {
      updateComment.mutate(
        { commentId: editingCommentId, content: comment },
        { onSuccess: resetCommentComposer },
      );
      return;
    }
    createComment.mutate(comment, { onSuccess: resetCommentComposer });
  };
  const onEditComment = (target: MarketDetailComment) => {
    setEditingCommentId(target.id);
    setComment(target.content ?? "");
  };
  const onDeleteComment = (target: MarketDetailComment) => {
    Alert.alert("댓글 삭제", "삭제한 댓글은 되돌릴 수 없어요.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteComment.mutate(target.id, {
            onSuccess: () => {
              if (editingCommentId === target.id) resetCommentComposer();
            },
          });
        },
      },
    ]);
  };
  const onDeletePost = () => {
    setShowDelete(true);
  };
  const onConfirmStatus = () => {
    if (!statusDraft || statusDraft === status) {
      setStatusDraft(null);
      return;
    }
    updateStatus.mutate(statusDraft, {
      onSuccess: () => setStatusDraft(null),
      onError: (error) => {
        Alert.alert(
          "상태 변경 실패",
          error instanceof Error
            ? error.message
            : "상태를 바꾸지 못했어요. 다시 시도해주세요.",
        );
      },
    });
  };
  const onConfirmDeletePost = () => {
    deletePost.mutate(undefined, {
      onSuccess: () => {
        setShowDelete(false);
        router.replace("/market");
      },
    });
  };

  return (
    <Screen scroll={false} padded={false} applyTopInset={false}>
      <View style={styles.root}>
        {/* 사진 위에서는 상태 바도 흰색. 이 화면이 보일 때만 바꾼다(다른 화면은 전역 dark) */}
        {isFocused ? <StatusBar style={isPastHero ? "dark" : "light"} /> : null}
        <View
          testID="market-detail-sticky-header"
          style={[
            styles.stickyHeader,
            insets.top > 0
              ? { paddingTop: insets.top, height: insets.top + 56 }
              : null,
            isPastHero
              ? styles.stickyHeaderScrolled
              : styles.stickyHeaderTransparent,
          ]}
        >
          <MotionPressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
            testID="market-detail-back"
          >
            {/* 사진 위에서는 흰색, 스크롤해 헤더가 bg 로 바뀌면 글자색 */}
            <AppIcon name="chevron-left" size={22} color={headerTint} />
            <AppText style={[styles.backText, { color: headerTint }]}>
              뒤로
            </AppText>
          </MotionPressable>
          {isPastHero ? (
            <View
              pointerEvents="none"
              style={[
                styles.headerTitleWrap,
                insets.top > 0 ? { top: insets.top } : null,
              ]}
            >
              <AppText numberOfLines={1} variant="heading">
                나눔 상세
              </AppText>
            </View>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={detail.isRefetching}
              onRefresh={() => void detail.refetch()}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressViewOffset={insets.top + 56}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          testID="market-detail-scroll"
        >
          <View style={[styles.hero, { height: width }]}>
            <Animated.ScrollView
              bounces={false}
              decelerationRate="fast"
              directionalLockEnabled
              disableIntervalMomentum
              horizontal
              nestedScrollEnabled
              onScroll={onHeroScroll}
              pagingEnabled
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={Math.max(width, 1)}
              testID="market-hero-carousel"
            >
              {market.images && market.images.length > 0
                ? market.images.map((uri, index, images) => (
                    <CarouselSlide
                      key={`${uri}-${index}`}
                      index={index}
                      scrollX={scrollX}
                      width={width}
                    >
                      <Pressable
                        accessibilityHint="사진을 크게 봅니다"
                        accessibilityLabel={`${market.title} 사진 ${index + 1}/${images.length}`}
                        accessibilityRole="imagebutton"
                        onPress={() => setViewerIndex(index)}
                        testID={`market-hero-photo-${index}`}
                      >
                        <Image
                          resizeMode="cover"
                          source={{ uri }}
                          style={[styles.heroThumb, { width, height: width }]}
                        />
                      </Pressable>
                    </CarouselSlide>
                  ))
                : [0, 1, 2].map((offset) => (
                    <CarouselSlide
                      key={offset}
                      index={offset}
                      scrollX={scrollX}
                      width={width}
                    >
                      <VisualThumb
                        size={width}
                        seed={market.thumbSeed + offset}
                        style={{ width, height: width, borderRadius: 0 }}
                      />
                    </CarouselSlide>
                  ))}
            </Animated.ScrollView>
            {/* 디자인 시스템 "사진 위 헤더": 위에서 60% → 0% 어두운 그라데이션, 높이 safe-top + 56 + 24 */}
            <LinearGradient
              colors={theme.scrim.photoHeader.colors}
              end={{ x: 0.5, y: 1 }}
              locations={theme.scrim.photoHeader.locations}
              pointerEvents="none"
              start={{ x: 0.5, y: 0 }}
              style={[
                styles.heroScrim,
                { height: insets.top + 56 + theme.spacing[6] },
              ]}
              testID="market-hero-scrim"
            />
            {isReserved ? <CenterBadge label="예약중" /> : null}
            {isDone ? (
              <>
                <View pointerEvents="none" style={styles.doneOverlay} />
                <Text pointerEvents="none" style={styles.doneHeroText}>
                  나눔완료
                </Text>
              </>
            ) : null}
            {!market.images ||
            market.images.length === 0 ||
            market.images.length > 1 ? (
              <View pointerEvents="none" style={styles.dots}>
                {(market.images && market.images.length > 1
                  ? market.images
                  : [0, 1, 2]
                ).map((_, index) => (
                  <CarouselDot
                    key={index}
                    index={index}
                    scrollX={scrollX}
                    width={width}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {isReserved ? (
            <StatusBanner
              icon="schedule"
              title="예약중인 나눔이에요"
              text="다른 분과 수령 약속이 진행 중이에요"
              warn
            />
          ) : null}
          {isDone ? (
            <StatusBanner
              icon="check"
              title="나눔이 끝났어요"
              text="이 게시글은 더 이상 신청할 수 없어요"
            />
          ) : null}

          <View style={isDone ? styles.doneContent : null}>
            <View style={styles.authorRow}>
              <Avatar name={authorName} size={40} />
              <View style={styles.authorText}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.meta}>{market.createdLabel}</Text>
              </View>
            </View>

            <View style={styles.article}>
              <View style={styles.chips}>
                <Badge
                  tone={isDone ? "neutral" : isReserved ? "warning" : "success"}
                >
                  {STATUS_OPTIONS.find((option) => option.value === status)
                    ?.label ?? "나눔중"}
                </Badge>
                {categoryName ? (
                  <Badge tone="info">{categoryName}</Badge>
                ) : null}
                <Badge tone="neutral">{market.conditionLabel}</Badge>
              </View>
              <Text style={styles.title}>{market.title}</Text>
              <Text style={styles.body}>{market.content}</Text>
            </View>

            {market.location ? (
              <PlaceCard value={market.location} testID="market-place" />
            ) : null}

            {isOwn ? (
              <View style={styles.actions}>
                {!isDone ? (
                  <>
                    <DetailAction
                      testID="market-edit-post"
                      icon="edit"
                      label="수정"
                      onPress={() =>
                        router.push({
                          pathname: "/modal/market-new",
                          params: { id: market.id },
                        })
                      }
                    />
                    <DetailAction
                      testID="market-delete-post"
                      icon="delete-outline"
                      label="삭제"
                      danger
                      onPress={onDeletePost}
                    />
                    <DetailAction
                      testID="market-change-status"
                      icon="sync-alt"
                      label="상태 변경"
                      onPress={() => setStatusDraft(status)}
                    />
                  </>
                ) : (
                  <>
                    <DetailAction
                      testID="market-delete-post"
                      icon="delete-outline"
                      label="삭제"
                      danger
                      onPress={onDeletePost}
                    />
                    <DetailAction
                      testID="market-change-status"
                      icon="sync-alt"
                      label="상태 변경"
                      onPress={() => setStatusDraft(status)}
                    />
                  </>
                )}
              </View>
            ) : null}

            <CommentsSection
              comments={market.comments}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          </View>
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
          style={styles.composer}
        >
          <View pointerEvents="box-none" style={styles.composerInner}>
            <LinearGradient
              colors={[
                "rgba(246,247,249,0)",
                "rgba(246,247,249,0.78)",
                "rgba(246,247,249,0.96)",
              ]}
              locations={[0, 0.38, 1]}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              testID="market-detail-composer-gradient"
            />
            <View style={styles.composerField}>
              {editingCommentId ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={resetCommentComposer}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  style={styles.cancelEdit}
                >
                  <Text style={styles.cancelEditText}>수정 취소</Text>
                </Pressable>
              ) : null}
              <TextInput
                testID="market-comment-input"
                value={comment}
                onChangeText={setComment}
                editable={!isCommentPending}
                placeholder={
                  editingCommentId
                    ? "댓글을 수정해주세요"
                    : "댓글을 입력해주세요"
                }
                placeholderTextColor={theme.colors.textMuted}
                style={styles.commentInput}
              />
              <Pressable
                testID="market-comment-submit"
                accessibilityRole="button"
                accessibilityLabel={
                  editingCommentId ? "댓글 수정" : "댓글 등록"
                }
                onPress={onSubmitComment}
                disabled={!comment.trim() || isCommentPending}
                hitSlop={3}
                style={[
                  styles.sendButton,
                  !comment.trim() && !isCommentPending
                    ? styles.sendButtonDisabled
                    : null,
                ]}
              >
                {isCommentPending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onPrimary}
                  />
                ) : (
                  <AppIcon
                    name="send"
                    size={17}
                    color={
                      !comment.trim()
                        ? theme.colors.textMuted
                        : theme.colors.onPrimary
                    }
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
        {createComment.isError ||
        updateComment.isError ||
        deleteComment.isError ? (
          <Text style={styles.commentError}>댓글을 처리하지 못했어요.</Text>
        ) : null}
        <RadioSheet
          visible={statusDraft !== null}
          title="나눔 상태 변경"
          options={STATUS_OPTIONS.map((option) => ({
            ...option,
            disabled: option.value === status,
          }))}
          value={statusDraft ?? status}
          onValueChange={(value) => setStatusDraft(value as MarketStatus)}
          confirmText="변경하기"
          confirmDisabled={
            updateStatus.isPending || !statusDraft || statusDraft === status
          }
          onClose={() => setStatusDraft(null)}
          onConfirm={onConfirmStatus}
        />
        <ConfirmDialog
          visible={showDelete}
          title="나눔 글을 삭제할까요?"
          message="삭제하면 댓글도 함께 사라지고 되돌릴 수 없어요."
          confirmText="삭제"
          danger
          onCancel={() => setShowDelete(false)}
          onConfirm={onConfirmDeletePost}
        />
        {market.images && market.images.length > 0 ? (
          <ImageViewer
            visible={viewerIndex !== null}
            images={market.images}
            initialIndex={viewerIndex ?? 0}
            onClose={() => setViewerIndex(null)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
