import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  ConfirmDialog,
  FloatingBottomBar,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  MotionPressable,
  Toast,
  TopBar,
} from "../../src/components/ui";
import { RadioRow } from "../../src/components/ui/checkbox";
import { InfoBox } from "../../src/components/ui/info-box";
import { PhotoTile } from "../../src/components/ui/photo-tile";
import { MARKET_CATEGORIES } from "../../src/constants/domainOptions";
import { theme } from "../../src/constants/theme";
import {
  useCreateMarketPost,
  useMarketDetail,
  useUpdateMarketPost,
} from "../../src/hooks/useMarket";
import { readDesignVariant } from "../../src/lib/designVariant";
import { prepareImageForUpload } from "../../src/lib/resizeImage";
import type { MarketDetail, MarketInput } from "../../src/types/market";

const categories = MARKET_CATEGORIES.slice(1) as readonly {
  key: MarketInput["category"];
  label: string;
}[];
const conditions = ["새것", "사용감 있음", "파손 있음"] as const;
const MAX_IMAGES = 5;
/** 32 칩 + 위아래 6 → 누르는 곳 44. */
const CHIP_HIT_SLOP = { top: 6, bottom: 6 };

const filledValues = {
  images: ["https://picsum.photos/seed/market-new/240/240"],
  category: "baby" as const,
  title: "아이 장난감 정리하면서 나눔합니다",
  condition: "사용감 있음",
  description:
    "아이가 커서 더 이상 쓰지 않는 장난감 정리해요. 토요일 오후 교회 1층 로비에서 수령 가능합니다.",
  location: "교회 1층 로비",
};

const emptyValues: MarketInput = {
  images: [],
  category: "etc",
  title: "",
  condition: "사용감 있음",
  description: "",
  location: "",
};

/** 수정할 글의 상세 응답을 입력값으로 바꾼다. 위치는 서버가 내려주지 않아 비워 둔다. */
function valuesFromDetail(detail: MarketDetail): MarketInput {
  const category =
    categories.find((item) => item.label === detail.categoryLabel)?.key ??
    "etc";
  return {
    images: detail.images ?? [],
    category,
    title: detail.title,
    condition: detail.conditionLabel || emptyValues.condition,
    description: detail.content,
    location: "",
  };
}

export default function MarketNewModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    designVariant?: string;
    id?: string;
  }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  // 수정 여부는 id 로 정한다. designVariant 는 릴리스 빌드에서 읽히지 않는다
  const editId = params.id;
  const isEdit = Boolean(editId) || variant === "edit";
  // 실제 글 수정은 서버의 글 내용으로 채운다. 디자인 미리보기(id 없음)만 예시 값을 쓴다
  const detailQuery = useMarketDetail(editId ?? "");
  const detail = editId ? detailQuery.data : undefined;
  const useFilledValues =
    (variant === "edit" && !editId) ||
    variant === "create-filled" ||
    variant === "back-warn" ||
    variant === "limit-toast";
  // 상세가 도착한 첫 값만 쓴다. 다시 불러와도 입력 중인 내용을 덮지 않게 한다
  const [loadedValues, setLoadedValues] = useState<MarketInput | undefined>(
    () => (detail ? valuesFromDetail(detail) : undefined),
  );
  const initialValues =
    loadedValues ?? (useFilledValues ? filledValues : emptyValues);
  const [values, setValues] = useState(initialValues);
  if (detail && !loadedValues) {
    // 상세가 늦게 도착한 경우: 렌더 중에 한 번 맞춘다(effect 없이)
    const next = valuesFromDetail(detail);
    setLoadedValues(next);
    setValues(next);
  }
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const createPost = useCreateMarketPost();
  const updatePost = useUpdateMarketPost(params.id ?? "");
  const isPending = createPost.isPending || updatePost.isPending;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const update = <Key extends keyof MarketInput>(
    key: Key,
    value: MarketInput[Key],
  ) => {
    setError(undefined);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setImages = (images: string[]) => {
    // 고르자마자 업로드용 축소를 시작해 등록 시 기다리지 않게 한다
    images.forEach(prepareImageForUpload);
    update("images", images);
  };

  // 나눔 수정 API(PUT /api/share/{id})는 사진을 받지 않아 수정 화면에선 사진을 바꿀 수 없다
  const canAddImage = !isEdit && values.images.length < MAX_IMAGES;

  const pickImages = async () => {
    if (!canAddImage) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "사진 접근 권한이 필요합니다",
        "사진을 첨부하려면 갤러리 접근을 허용해주세요.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      // quality 는 기본값(1)으로 둔다. 압축은 업로드 직전 resizeImageForUpload 가 한 번만 한다
      selectionLimit: Math.max(1, MAX_IMAGES - values.images.length),
    });

    if (result.canceled) return;

    const selected = result.assets.map((asset) => asset.uri).filter(Boolean);
    setImages([...values.images, ...selected].slice(0, MAX_IMAGES));
  };

  const close = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
      return;
    }
    router.back();
  };

  const submit = async () => {
    setError(undefined);
    try {
      if (params.id) {
        await updatePost.mutateAsync({
          title: values.title,
          description: values.description,
          category: values.category,
          condition: values.condition,
        });
        router.replace(`/market/${params.id}`);
      } else {
        const created = await createPost.mutateAsync(values);
        router.replace(`/market/${created.id}`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEdit
            ? "나눔을 수정하지 못했습니다."
            : "나눔을 등록하지 못했습니다.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
      testID="market-form-screen"
    >
      <TopBar
        title={isEdit ? "나눔 수정" : "나눔 등록"}
        close
        onBack={close}
        testID="market-form-header"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.body}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <Section
              label="사진"
              required
              hint={
                isEdit
                  ? "사진은 수정할 수 없어요"
                  : `사진 ${values.images.length}/${MAX_IMAGES}`
              }
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
                testID="market-photo-row"
              >
                {canAddImage ? (
                  <PhotoTile
                    variant="add"
                    onPress={pickImages}
                    testID="market-photo-add"
                  />
                ) : null}
                {values.images.map((uri, index) => (
                  <PhotoTile
                    key={uri}
                    variant="photo"
                    uri={uri}
                    index={index}
                    cover={index === 0}
                    onRemove={
                      isEdit
                        ? undefined
                        : () =>
                            setImages(
                              values.images.filter((item) => item !== uri),
                            )
                    }
                    testID={`market-photo-${index}`}
                  />
                ))}
              </ScrollView>
            </Section>

            <Section label="카테고리" required>
              <View style={styles.chips}>
                {categories.map((category) => {
                  const selected = values.category === category.key;
                  return (
                    <MotionPressable
                      key={category.key}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      hitSlop={CHIP_HIT_SLOP}
                      onPress={() => update("category", category.key)}
                      style={[styles.chip, selected ? styles.chipOn : null]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextOn : null,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </MotionPressable>
                  );
                })}
              </View>
            </Section>

            <Section label="제목" required hint={`${values.title.length}/30`}>
              <FormInput
                accessibilityLabel="나눔 제목"
                value={values.title}
                onChangeText={(title) => update("title", title)}
                maxLength={30}
                placeholder="제목을 입력해주세요 (최대 30자)"
              />
            </Section>

            <Section label="물품 상태" required>
              <View style={styles.conditionList}>
                {conditions.map((condition) => (
                  <RadioRow
                    key={condition}
                    label={condition}
                    selected={values.condition === condition}
                    onPress={() => update("condition", condition)}
                  />
                ))}
              </View>
            </Section>

            <Section
              label="상세 설명"
              required
              hint={`${values.description.length}/500`}
            >
              <FormInput
                accessibilityLabel="나눔 상세 설명"
                multiline
                value={values.description}
                onChangeText={(description) =>
                  update("description", description)
                }
                maxLength={500}
                placeholder="물품 상태, 수령 방법, 일정 등을 자세히 적어주세요"
                textAlignVertical="top"
              />
            </Section>

            <Section label="수령 장소" required>
              <FormInput
                accessibilityLabel="나눔 수령 장소"
                value={values.location}
                onChangeText={(location) => update("location", location)}
                placeholder="예: 교회 1층 로비"
              />
            </Section>

            <InfoBox
              tone="info"
              description="직거래 시 안전한 장소(교회 로비 등)에서 만나주세요."
              style={styles.infoBox}
            />
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <FloatingBottomBar
        disabled={isPending}
        label={isEdit ? "변경사항 저장" : "나눔 등록"}
        loading={isPending}
        onPress={submit}
        testID="market-new"
      />

      <ConfirmDialog
        visible={showCloseConfirm}
        title="작성을 그만둘까요?"
        message="입력한 내용은 저장되지 않습니다."
        confirmText="나가기"
        danger
        onCancel={() => setShowCloseConfirm(false)}
        onConfirm={() => router.back()}
      />
      <Toast
        message={
          variant === "limit-toast"
            ? "하루에 나눔은 5개까지 등록할 수 있어요"
            : ""
        }
        offset={96}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: theme.layout.screenX,
  },
  body: { paddingBottom: 112 },
  photoRow: {
    gap: theme.spacing[2],
    paddingHorizontal: theme.layout.screenX,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: theme.spacing[2],
    // 위아래로 늘린 누르는 곳(6)이 윗줄과 겹치지 않게 줄 간격을 12로 둔다.
    rowGap: theme.spacing[3],
    paddingHorizontal: theme.layout.screenX,
  },
  // 디자인 시스템 칩: 높이 32, 안쪽 0×14, 12/500, radius-full.
  chip: {
    minHeight: theme.size.chipHeight,
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
  },
  chipOn: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primarySubtle,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.medium,
  },
  chipTextOn: {
    color: theme.colors.primaryStrong,
    fontWeight: theme.fontWeight.semibold,
  },
  conditionList: {
    gap: theme.spacing[2],
    paddingHorizontal: theme.layout.screenX,
  },
  infoBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 22,
  },
  errorText: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 12,
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },
});
