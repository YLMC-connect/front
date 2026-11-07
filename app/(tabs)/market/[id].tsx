import { AppIcon } from "@/components/ui/app-icon";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  DetailAction,
  ErrorState,
  MotionPressable,
  Skeleton,
  TopBar,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useCreateMarketComment,
  useDeleteMarketComment,
  useDeleteMarketPost,
  useMarketDetail,
  useUpdateMarketComment,
} from "../../../src/hooks/useMarket";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { MarketDetailComment } from "../../../src/types/market";
import {
  CarouselDot,
  CarouselSlide,
  CenterBadge,
  CommentsSection,
  StatusBanner,
} from "../../../src/components/market/detail/MarketDetailParts";
import { styles } from "../../../src/components/market/detail/marketDetailStyles";

export default function MarketDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const id = params.id ?? "1";
  const variant = readDesignVariant(params.designVariant);
  const detail = useMarketDetail(id);
  const createComment = useCreateMarketComment(id);
  const updateComment = useUpdateMarketComment(id);
  const deleteComment = useDeleteMarketComment(id);
  const deletePost = useDeleteMarketPost(id);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(variant === "delete-confirm");
  const [seenDeleteVariant, setSeenDeleteVariant] = useState(variant);
  if (variant !== seenDeleteVariant) {
    setSeenDeleteVariant(variant);
    setShowDelete(variant === "delete-confirm");
  }
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isPastHero, setIsPastHero] = useState(false);
  const scrollX = useSharedValue(0);
  const onHeroScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });
  const heroThreshold = Math.max(width - (insets.top + 56), 1);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const past = offsetY >= heroThreshold;
    if (past !== isPastHero) {
      setIsPastHero(past);
    }
  };

  if (variant === "deleted" || variant === "blocked") {
    return (
      <Screen>
        <View style={styles.exception}>
          <AppIcon
            name={variant === "deleted" ? "inventory-2" : "block"}
            size={42}
            color={theme.colors.textMuted}
          />
          <Text style={styles.exceptionTitle}>
            {variant === "deleted"
              ? "존재하지 않는 게시글입니다"
              : "확인할 수 없는 게시글입니다"}
          </Text>
          <Text style={styles.exceptionText}>
            {variant === "deleted"
              ? "삭제되었거나 더 이상 접근할 수 없는 게시글이에요."
              : "차단한 사용자의 게시글은 볼 수 없어요."}
          </Text>
        </View>
      </Screen>
    );
  }

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
  const isOwn = variant ? !variant.startsWith("other") : market.isMine;
  const status =
    variant === "own-reserved"
      ? "reserved"
      : variant === "own-done"
        ? "done"
        : market.status;
  const isReserved = status === "reserved";
  const isDone = status === "done";
  const authorName = variant?.startsWith("other")
    ? "박정아"
    : market.authorName;
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
    Alert.alert("댓글 삭제", "삭제한 댓글은 복구할 수 없습니다.", [
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
          >
            <AppIcon name="chevron-left" size={22} color={theme.colors.text} />
            <Text style={styles.backText}>뒤로</Text>
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
                      <Image
                        accessible
                        accessibilityRole="image"
                        accessibilityLabel={`${market.title} 사진 ${index + 1}/${images.length}`}
                        resizeMode="cover"
                        source={{ uri }}
                        style={[styles.heroThumb, { width, height: width }]}
                      />
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
            <LinearGradient
              colors={[
                "rgba(25,31,40,0.22)",
                "rgba(25,31,40,0.10)",
                "rgba(25,31,40,0)",
              ]}
              end={{ x: 0.5, y: 1 }}
              locations={[0, 0.52, 1]}
              pointerEvents="none"
              start={{ x: 0.5, y: 0 }}
              style={styles.heroScrim}
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
              title="예약중인 나눔입니다"
              text="다른 분과 수령 약속이 진행 중이에요"
              warn
            />
          ) : null}
          {isDone ? (
            <StatusBanner
              icon="check"
              title="나눔이 완료되었습니다"
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
                <Badge tone="info">{market.categoryLabel}</Badge>
                <Badge tone="neutral">{market.conditionLabel}</Badge>
              </View>
              <Text style={styles.title}>{market.title}</Text>
              <Text style={styles.body}>{market.content}</Text>
            </View>

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
                          params: { id: market.id, designVariant: "edit" },
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
                    <DetailAction icon="sync-alt" label="상태 변경" />
                  </>
                ) : (
                  <DetailAction
                    testID="market-delete-post"
                    icon="delete-outline"
                    label="삭제"
                    danger
                    onPress={onDeletePost}
                  />
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
          <Text style={styles.commentError}>댓글 처리에 실패했습니다.</Text>
        ) : null}
        <ConfirmDialog
          visible={showDelete}
          title="게시글을 삭제하시겠습니까?"
          message="삭제하면 댓글을 포함한 모든 내용이 사라지며 복구할 수 없어요."
          confirmText="삭제"
          danger
          onCancel={() => setShowDelete(false)}
          onConfirm={onConfirmDeletePost}
        />
      </View>
    </Screen>
  );
}
