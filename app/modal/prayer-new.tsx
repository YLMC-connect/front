import { InfoBox } from "@/components/ui/info-box";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  ConfirmDialog,
  FilterChips,
  FloatingBottomBar,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import {
  useCreatePrayerTopicApi,
  usePrayerCategories,
} from "../../src/hooks/usePrayers";

// 익명 작성은 등록 API(categoryId·title·content)에 필드가 없어 선택지를 두지 않는다.
type FormValues = {
  title: string;
  content: string;
};

export default function PrayerNewModal() {
  const router = useRouter();
  const { roomId = "" } = useLocalSearchParams<{ roomId: string }>();
  const createTopicApi = useCreatePrayerTopicApi();
  const categoriesQuery = usePrayerCategories();
  const categories = categoriesQuery.data ?? [];
  const [pickedCategoryId, setPickedCategoryId] = useState<number | null>(null);
  // 고르기 전에는 불러온 첫 카테고리가 선택된 것으로 보이고, 그대로 전송된다.
  const selectedCategoryId =
    categories.find((c) => c.id === pickedCategoryId)?.id ?? categories[0]?.id;

  const [values, setValues] = useState<FormValues>({
    title: "",
    content: "",
  });
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isSubmitting = createTopicApi.isPending;

  const isDirty =
    values.title.trim().length > 0 || values.content.trim().length > 0;

  const close = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
      return;
    }
    router.back();
  };

  const onSubmit = () => {
    setError(undefined);
    if (values.title.trim().length < 2) {
      setError("기도제목 제목을 2자 이상 입력해주세요.");
      return;
    }
    if (values.content.trim().length < 5) {
      setError("기도 내용을 5자 이상 입력해주세요.");
      return;
    }

    if (selectedCategoryId == null) {
      setError("카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      void categoriesQuery.refetch();
      return;
    }
    const categoryId = selectedCategoryId;

    const onComplete = () => {
      if (roomId) {
        router.replace({
          pathname: "/prayer/[id]",
          params: { id: roomId },
        });
      } else {
        router.back();
      }
    };

    const onError = (submitError: unknown) => {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "기도제목을 등록하지 못했습니다.",
      );
    };

    createTopicApi.mutate(
      {
        categoryId,
        title: values.title.trim(),
        content: values.content.trim(),
      },
      {
        onSuccess: onComplete,
        onError,
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
      testID="prayer-form-screen"
    >
      <TopBar
        title="기도제목 등록"
        close
        onBack={close}
        testID="prayer-form-header"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.body}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            {categories.length > 0 ? (
              <Section label="카테고리" required>
                <FilterChips
                  items={categories.map((category) => ({
                    key: String(category.id),
                    label: category.categoryName,
                  }))}
                  active={String(selectedCategoryId)}
                  onChange={(key) => setPickedCategoryId(Number(key))}
                  testIDPrefix="prayer-form-category"
                  wrap
                />
              </Section>
            ) : null}

            <Section label="제목" required hint={`${values.title.length}/30`}>
              <FormInput
                accessibilityLabel="기도제목 제목"
                value={values.title}
                onChangeText={(title) => {
                  setError(undefined);
                  setValues((current) => ({ ...current, title }));
                }}
                maxLength={30}
                placeholder="기도제목 제목을 입력해주세요 (최대 30자)"
              />
            </Section>

            <Section
              label="기도 내용"
              required
              hint={`${values.content.length}/500`}
            >
              <FormInput
                accessibilityLabel="기도 내용"
                multiline
                value={values.content}
                onChangeText={(content) => {
                  setError(undefined);
                  setValues((current) => ({ ...current, content }));
                }}
                maxLength={500}
                placeholder="함께 기도받고 싶은 내용을 자세히 적어주세요"
                textAlignVertical="top"
              />
            </Section>

            <InfoBox
              description="작성한 기도제목은 중보기도팀 검토 후 기도방에 게시됩니다."
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
        disabled={isSubmitting}
        label="기도제목 등록"
        loading={isSubmitting}
        onPress={onSubmit}
        testID="prayer-new"
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
});
