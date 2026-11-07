import { AppIcon } from "@/components/ui/app-icon";
import { InfoBox } from "@/components/ui/info-box";
import { InputErrorText } from "@/components/ui/inputs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  AppText,
  ConfirmDialog,
  ErrorState,
  FilterChips,
  FloatingBottomBar,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  SectionDivider,
  TopBar,
} from "../../src/components/ui";
import { GROUP_CATEGORIES } from "../../src/constants/domainOptions";
import { theme } from "../../src/constants/theme";
import {
  useCreateGroup,
  useGroupDetail,
  useUpdateGroup,
} from "../../src/hooks/useGroups";
import { readDesignVariant } from "../../src/lib/designVariant";
import { toCommunionCategoryCode } from "../../src/services/groupMapper";
import type { GroupDetail, GroupInput } from "../../src/types/group";

// 서버 카테고리 코드가 있는 것만 고르게 한다. 없는 카테고리는 개설 요청이 거절된다.
const categories = GROUP_CATEGORIES.filter(
  (category) =>
    category.key !== "all" && Boolean(toCommunionCategoryCode(category.key)),
) as readonly {
  key: GroupInput["category"];
  label: string;
}[];

const CAPACITY_PRESETS = [4, 8, 12, 20] as const;
const CAPACITY_PRESET_ITEMS = CAPACITY_PRESETS.map((preset) => ({
  key: String(preset),
  label: `${preset}명`,
}));

/**
 * FilterChips 는 고른 값이 칩 목록에 없으면 표시 막대를 마지막 칩에 그대로 둔다.
 * 직접 입력·증감으로 빠른 선택 밖 값이 되면 다시 그려 강조를 지운다.
 */
function presetChipsKey(
  name: string,
  items: readonly { key: string }[],
  active: string,
) {
  return items.some((item) => item.key === active)
    ? `${name}-preset`
    : `${name}-custom`;
}

const filledValues: GroupInput = {
  category: "sport",
  name: "토요 산악회",
  description:
    "매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.",
  maxMembers: 25,
};

const emptyValues: GroupInput = {
  category: "etc",
  name: "",
  description: "",
  maxMembers: 10,
};

const DESIGN_EDIT_VARIANTS = ["edit", "range-error", "member-error"];

function toGroupInput(detail: GroupDetail): GroupInput {
  const matchedCategory = GROUP_CATEGORIES.find(
    (c) => c.label === detail.categoryLabel,
  )?.key;
  const category = (
    matchedCategory && matchedCategory !== "all" ? matchedCategory : "etc"
  ) as GroupInput["category"];
  return {
    category,
    name: detail.name,
    description: detail.description,
    maxMembers: detail.maxMembers,
  };
}

/** 디자인 미리보기(id 없음)에서만 예시 값을 쓴다. */
function designInitialValues(variant: string): GroupInput {
  const useFilledValues =
    DESIGN_EDIT_VARIANTS.includes(variant) || variant === "create-filled";
  return {
    ...(useFilledValues ? filledValues : emptyValues),
    maxMembers:
      variant === "range-error"
        ? 150
        : variant === "member-error"
          ? 15
          : useFilledValues
            ? filledValues.maxMembers
            : emptyValues.maxMembers,
  };
}

export default function GroupNewModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const existingDetail = useGroupDetail(params.id ?? "");

  if (!params.id) {
    return (
      <GroupForm
        variant={variant}
        isEdit={DESIGN_EDIT_VARIANTS.includes(variant)}
        initialValues={designInitialValues(variant)}
      />
    );
  }

  // 실제 수정은 소모임 정보가 도착한 뒤에 폼을 채워 그린다.
  if (!existingDetail.data) {
    return (
      <View style={styles.root} testID="group-form-screen">
        <TopBar
          title="소모임 수정"
          close
          onBack={() => router.back()}
          testID="group-form-header"
        />
        {existingDetail.isError ? (
          <ErrorState
            message="소모임 정보를 다시 불러와주세요."
            onRetry={() => void existingDetail.refetch()}
          />
        ) : (
          <ActivityIndicator
            accessibilityLabel="소모임 정보를 불러오는 중"
            color={theme.colors.primary}
            style={styles.loading}
          />
        )}
      </View>
    );
  }

  return (
    <GroupForm
      key={params.id}
      groupId={params.id}
      variant={variant}
      isEdit
      initialValues={toGroupInput(existingDetail.data)}
    />
  );
}

function GroupForm({
  groupId,
  variant,
  isEdit,
  initialValues,
}: {
  groupId?: string;
  variant: string;
  isEdit: boolean;
  initialValues: GroupInput;
}) {
  const router = useRouter();
  const createGroup = useCreateGroup();
  const updateGroupMutation = useUpdateGroup(groupId ?? "");
  const isPending = createGroup.isPending || updateGroupMutation.isPending;

  const [values, setValues] = useState(initialValues);
  const [capacity, setCapacity] = useState(String(initialValues.maxMembers));
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const update = <Key extends keyof GroupInput>(
    key: Key,
    value: GroupInput[Key],
  ) => {
    setError(undefined);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const changeCapacity = (delta: number) => {
    const current = Number(capacity) || values.maxMembers || 2;
    const next = Math.max(2, Math.min(100, current + delta));
    setCapacity(String(next));
    update("maxMembers", next);
  };

  const setCapacityPreset = (target: number) => {
    setCapacity(String(target));
    update("maxMembers", target);
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
      if (groupId) {
        await updateGroupMutation.mutateAsync({
          name: values.name,
          description: values.description,
          category: values.category,
          maxMembers: values.maxMembers,
        });
        router.replace(`/group/${groupId}`);
      } else {
        const created = await createGroup.mutateAsync(values);
        router.replace(`/group/${created.id}`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEdit
            ? "소모임을 수정하지 못했습니다."
            : "소모임을 개설하지 못했습니다.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
      testID="group-form-screen"
    >
      <TopBar
        title={isEdit ? "소모임 수정" : "소모임 개설"}
        close
        onBack={close}
        testID="group-form-header"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.body}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <InfoBox
              description="비슷한 목적의 소모임이 이미 있다면 기존 소모임 참여를 먼저 고려해주세요."
              style={styles.infoBox}
            />

            {/* 그룹 1: 기본 정보 */}
            <View style={styles.groupHeader}>
              <AppText
                variant="body"
                weight="semibold"
                style={styles.groupTitle}
              >
                기본 정보
              </AppText>
              <AppText variant="caption" tone="muted">
                어떤 소모임인지 소개해 주세요
              </AppText>
            </View>

            <Section label="카테고리" required>
              <FilterChips
                items={categories}
                active={values.category}
                onChange={(category) => update("category", category)}
                testIDPrefix="group-form-category"
                wrap
              />
            </Section>

            <Section
              label="소모임명"
              required
              hint={`${values.name.length}/20`}
            >
              <FormInput
                accessibilityLabel="소모임 이름"
                value={values.name}
                onChangeText={(name) => update("name", name)}
                maxLength={20}
                placeholder="소모임 이름을 입력해주세요 (최대 20자)"
              />
            </Section>

            <Section
              label="설명"
              required
              hint={`${values.description.length}/200`}
            >
              <FormInput
                accessibilityLabel="소모임 설명"
                multiline
                value={values.description}
                onChangeText={(description) =>
                  update("description", description)
                }
                maxLength={200}
                placeholder="어떤 소모임인지, 어떻게 모이는지 알려주세요"
                textAlignVertical="top"
              />
            </Section>

            <SectionDivider />

            {/* 그룹 2: 모임 활동 안내 */}
            <View style={styles.groupHeader}>
              <AppText
                variant="body"
                weight="semibold"
                style={styles.groupTitle}
              >
                활동 및 운영 안내
              </AppText>
              <AppText variant="caption" tone="muted">
                몇 명이 함께 모이나요?
              </AppText>
            </View>

            <Section label="최대인원" required hint="2~100명">
              <View style={styles.capacityStepperRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="정원 1명 감소"
                  disabled={Number(capacity) <= 2}
                  onPress={() => changeCapacity(-1)}
                  style={[
                    styles.stepperButton,
                    Number(capacity) <= 2 ? styles.stepperButtonDisabled : null,
                  ]}
                >
                  <AppIcon
                    name="remove"
                    size={18}
                    color={
                      Number(capacity) <= 2
                        ? theme.colors.textMuted
                        : theme.colors.text
                    }
                  />
                </Pressable>
                <View style={styles.capacityInputWrap}>
                  <FormInput
                    accessibilityLabel="소모임 최대인원"
                    keyboardType="number-pad"
                    value={capacity}
                    onChangeText={(text) => {
                      setCapacity(text);
                      update("maxMembers", Number(text) || 0);
                    }}
                    placeholder="숫자"
                    style={styles.capacityInput}
                  />
                  <Text style={styles.capacityUnit}>명</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="정원 1명 증가"
                  disabled={Number(capacity) >= 100}
                  onPress={() => changeCapacity(1)}
                  style={[
                    styles.stepperButton,
                    Number(capacity) >= 100
                      ? styles.stepperButtonDisabled
                      : null,
                  ]}
                >
                  <AppIcon
                    name="add"
                    size={18}
                    color={
                      Number(capacity) >= 100
                        ? theme.colors.textMuted
                        : theme.colors.text
                    }
                  />
                </Pressable>
              </View>

              <FilterChips
                key={presetChipsKey(
                  "capacity",
                  CAPACITY_PRESET_ITEMS,
                  String(values.maxMembers),
                )}
                items={CAPACITY_PRESET_ITEMS}
                active={String(values.maxMembers)}
                onChange={(preset) => setCapacityPreset(Number(preset))}
                style={styles.quickPresetScroll}
                testIDPrefix="group-form-capacity"
              />

              {variant === "range-error" ? (
                <View style={styles.inlineError}>
                  <InputErrorText>2~100명 사이로 입력해주세요</InputErrorText>
                </View>
              ) : null}
              {variant === "member-error" ? (
                <View style={styles.inlineError}>
                  <InputErrorText>
                    현재 멤버수(18명)보다 적게 설정할 수 없습니다
                  </InputErrorText>
                </View>
              ) : null}
            </Section>

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
        label={isEdit ? "변경사항 저장" : "소모임 개설"}
        loading={isPending}
        onPress={submit}
        testID="group-new"
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
  loading: { marginTop: 48 },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.layout.screenX,
  },
  capacityStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.layout.screenX,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  capacityInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  capacityInput: {
    width: 100,
    height: 48,
    marginHorizontal: 0,
    textAlign: "center",
  },
  capacityUnit: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
  },
  inlineError: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 8,
  },
  groupHeader: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 3,
  },
  groupTitle: {
    fontWeight: theme.fontWeight.bold,
  },
  infoBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 10,
    marginBottom: 8,
  },
  quickPresetScroll: {
    flexGrow: 0,
    marginTop: theme.spacing[1],
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
