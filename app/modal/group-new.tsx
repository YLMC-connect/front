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
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  ConfirmDialog,
  ErrorState,
  FloatingBottomBar,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  MotionPressable,
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
 * 입력 카드 안 고르기 칩: 회색(surface-subtle) 알약, 고르면 primary-subtle + primary-strong.
 * 한 줄로 두고 넘치면 가로로 민다. 고른 값이 목록에 없으면(직접 입력한 정원) 아무 칩도 칠하지 않는다.
 */
function ChoiceChips<T extends string>({
  items,
  active,
  onChange,
  style,
  testIDPrefix,
}: {
  items: readonly { key: T; label: string }[];
  active: string;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
  testIDPrefix: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.chipScroll, style]}
      contentContainerStyle={styles.chipRow}
      testID={`${testIDPrefix}-scroll`}
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <MotionPressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            hitSlop={CHIP_HIT_SLOP}
            onPress={() => {
              if (!selected) onChange(item.key);
            }}
            style={[styles.chip, selected ? styles.chipOn : null]}
            testID={`${testIDPrefix}-${item.key}`}
          >
            <Text
              style={[styles.chipText, selected ? styles.chipTextOn : null]}
            >
              {item.label}
            </Text>
          </MotionPressable>
        );
      })}
    </ScrollView>
  );
}

/** 32 칩 + 위아래 6 → 누르는 곳 44. */
const CHIP_HIT_SLOP = { top: 6, bottom: 6 };

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
    kind?: string;
  }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const existingDetail = useGroupDetail(params.id ?? "");
  const kind = params.kind === "service" ? "service" : "group";

  if (!params.id) {
    return (
      <GroupForm
        variant={variant}
        isEdit={DESIGN_EDIT_VARIANTS.includes(variant)}
        initialValues={designInitialValues(variant)}
        kind={kind}
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
  kind = "group",
}: {
  groupId?: string;
  variant: string;
  isEdit: boolean;
  initialValues: GroupInput;
  kind?: "group" | "service";
}) {
  const kindLabel = kind === "service" ? "봉사" : "소모임";
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
        // 상세에서 연 수정 창이므로 닫으면 상세로 돌아간다
        router.back();
      } else {
        const created = await createGroup.mutateAsync({ ...values, kind });
        // 창을 닫고 목록 위에 상세를 쌓아야 뒤로가기가 목록으로 간다
        router.back();
        router.push(`/group/${created.id}`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEdit
            ? "소모임을 수정하지 못했습니다."
            : kind === "service"
              ? "봉사를 개설하지 못했습니다."
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
        title={isEdit ? "소모임 수정" : `${kindLabel} 개설`}
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

            <Section card label="카테고리" required>
              <ChoiceChips
                items={categories}
                active={values.category}
                onChange={(category) => update("category", category)}
                testIDPrefix="group-form-category"
              />
            </Section>

            <Section
              card
              label="소모임명"
              required
              hint={`${values.name.length}/20`}
            >
              <FormInput
                style={styles.cardField}
                accessibilityLabel="소모임 이름"
                value={values.name}
                onChangeText={(name) => update("name", name)}
                maxLength={20}
                placeholder="소모임 이름을 입력해주세요 (최대 20자)"
              />
            </Section>

            <Section
              card
              label="설명"
              required
              hint={`${values.description.length}/200`}
            >
              <FormInput
                style={styles.cardField}
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

            <Section card label="최대인원" required hint="2~100명">
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

              <ChoiceChips
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
        label={isEdit ? "변경사항 저장" : `${kindLabel} 개설`}
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
  },
  cardField: { marginHorizontal: 0 },
  // 카드 안쪽 16 을 넘어 카드 가장자리까지 밀리게 좌우로 넓힌다.
  chipScroll: {
    flexGrow: 0,
    marginHorizontal: -theme.spacing[4],
  },
  chipRow: {
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  chip: {
    height: theme.size.chipHeight,
    justifyContent: "center",
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: theme.spacing[4],
  },
  chipOn: {
    backgroundColor: theme.colors.primarySubtle,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.primaryStrong,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
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
    lineHeight: theme.typography.label.lineHeight,
  },
  inlineError: {
    marginTop: 8,
  },
  infoBox: {
    marginHorizontal: theme.layout.screenX,
    marginBottom: theme.spacing[4],
  },
  quickPresetScroll: {
    marginTop: theme.spacing[3],
  },
  errorText: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 12,
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
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
