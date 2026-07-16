import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Button,
  ConfirmDialog,
  ImagePickerField,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  Toast,
  TopBar,
} from "../../src/components/ui";
import { SCREEN_HEADER_VERTICAL_PADDING } from "../../src/components/ui/screen-header";
import { MARKET_CATEGORIES } from "../../src/constants/domainOptions";
import { theme } from "../../src/constants/theme";
import { useCreateMarketPost } from "../../src/hooks/useMarket";
import { readDesignVariant } from "../../src/lib/designVariant";
import type { MarketInput } from "../../src/types/market";

const categories = MARKET_CATEGORIES.slice(1) as readonly {
  key: MarketInput["category"];
  label: string;
}[];
const conditions = ["새것", "사용감 있음", "파손 있음"] as const;

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

export default function MarketNewModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit = variant === "edit";
  const useFilledValues =
    isEdit ||
    variant === "create-filled" ||
    variant === "back-warn" ||
    variant === "limit-toast";
  const initialValues = useMemo<MarketInput>(
    () => (useFilledValues ? filledValues : emptyValues),
    [useFilledValues],
  );
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const createPost = useCreateMarketPost();
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const update = <Key extends keyof MarketInput>(
    key: Key,
    value: MarketInput[Key],
  ) => {
    setError(undefined);
    setValues((current) => ({ ...current, [key]: value }));
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
      const created = await createPost.mutateAsync(values);
      router.replace(`/market/${created.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "나눔을 등록하지 못했습니다.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        styles.root,
        { paddingTop: insets.top + SCREEN_HEADER_VERTICAL_PADDING },
      ]}
      testID="market-form-screen"
    >
      <TopBar
        title={isEdit ? "나눔 수정" : "나눔 등록"}
        back
        onBack={close}
        testID="market-form-header"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
      >
        <Section label="사진" required hint={`사진 ${values.images.length}/5`}>
          <View style={styles.fieldInset}>
            <ImagePickerField
              value={values.images}
              onChange={(images) => update("images", images)}
              maxImages={5}
            />
          </View>
        </Section>

        <Section label="카테고리" required>
          <View style={styles.chips}>
            {categories.map((category) => {
              const selected = values.category === category.key;
              return (
                <Pressable
                  key={category.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
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
                </Pressable>
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
          <View style={styles.conditionRow}>
            {conditions.map((condition) => {
              const selected = values.condition === condition;
              return (
                <Pressable
                  key={condition}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => update("condition", condition)}
                  style={[
                    styles.condition,
                    selected ? styles.conditionOn : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      selected ? styles.conditionTextOn : null,
                    ]}
                  >
                    {condition}
                  </Text>
                </Pressable>
              );
            })}
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
            onChangeText={(description) => update("description", description)}
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

        <View style={styles.infoBox}>
          <AppIcon name="info" size={16} color={theme.colors.primaryDeep} />
          <Text style={styles.infoText}>
            직거래 시 안전한 장소(교회 로비 등)에서 만나주세요.
          </Text>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={submit} loading={createPost.isPending}>
          {isEdit ? "변경사항 저장" : "나눔 등록"}
        </Button>
      </View>

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
  root: { flex: 1, backgroundColor: theme.colors.bg },
  body: { paddingBottom: 24 },
  fieldInset: { paddingHorizontal: theme.layout.screenX },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: theme.layout.screenX,
  },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
  },
  chipOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: { color: theme.colors.white },
  conditionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: theme.layout.screenX,
  },
  condition: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  conditionOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  conditionText: { color: theme.colors.inkSoft, fontSize: theme.fontSize.sm },
  conditionTextOn: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  infoBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 22,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  errorText: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 12,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },
});
