import { AppIcon } from "@/components/ui/app-icon";
import { InfoBox } from "@/components/ui/info-box";
import { InputErrorText } from "@/components/ui/inputs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  AppText,
  ConfirmDialog,
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
import type { GroupInput } from "../../src/types/group";

const categories = GROUP_CATEGORIES.slice(1) as readonly {
  key: GroupInput["category"];
  label: string;
}[];

const CAPACITY_PRESETS = [4, 8, 12, 20] as const;
const CAPACITY_PRESET_ITEMS = CAPACITY_PRESETS.map((preset) => ({
  key: String(preset),
  label: `${preset}명`,
}));
const SCHEDULE_PRESETS = [
  "매주 토요일",
  "매주 주일",
  "격주 토요일",
  "평일 저녁",
] as const;
const LOCATION_PRESETS = ["교회", "온라인 (Zoom)", "외부 모임"] as const;
const SCHEDULE_PRESET_ITEMS = SCHEDULE_PRESETS.map((schedule) => ({
  key: schedule,
  label: schedule,
}));
const LOCATION_PRESET_ITEMS = LOCATION_PRESETS.map((location) => ({
  key: location,
  label: location,
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
  schedule: "매주 토요일 오전 8시",
  location: "교회 1층 로비 집결",
};

const emptyValues: GroupInput = {
  category: "etc",
  name: "",
  description: "",
  maxMembers: 10,
  schedule: "",
  location: "",
};

export default function GroupNewModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit =
    Boolean(params.id) ||
    ["edit", "range-error", "member-error"].includes(variant);
  const useFilledValues = isEdit || variant === "create-filled";
  const createGroup = useCreateGroup();
  const updateGroupMutation = useUpdateGroup(params.id ?? "");
  const isPending = createGroup.isPending || updateGroupMutation.isPending;
  const existingDetail = useGroupDetail(params.id ?? "");
  const detailData = existingDetail.data;

  const initialValues = useMemo<GroupInput>(() => {
    if (params.id && detailData) {
      const matchedCategory = GROUP_CATEGORIES.find(
        (c) => c.label === detailData.categoryLabel,
      )?.key;
      const category = (
        matchedCategory && matchedCategory !== "all" ? matchedCategory : "etc"
      ) as GroupInput["category"];
      return {
        category,
        name: detailData.name,
        description: detailData.description,
        maxMembers: detailData.maxMembers,
        schedule: "",
        location: "",
      };
    }
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
  }, [detailData, params.id, useFilledValues, variant]);

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
      if (params.id) {
        await updateGroupMutation.mutateAsync({
          name: values.name,
          description: values.description,
          category: values.category,
          maxMembers: values.maxMembers,
        });
        router.replace(`/group/${params.id}`);
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
                style={styles.chipScroll}
                testIDPrefix="group-form-category"
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
                언제, 어디서, 몇 명이 함께 모이나요?
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

            <Section label="모임 일정" required>
              <FormInput
                accessibilityLabel="소모임 일정"
                value={values.schedule}
                onChangeText={(schedule) => update("schedule", schedule)}
                placeholder="예: 매주 토요일 오전 10시"
              />
              <FilterChips
                key={presetChipsKey(
                  "schedule",
                  SCHEDULE_PRESET_ITEMS,
                  values.schedule,
                )}
                items={SCHEDULE_PRESET_ITEMS}
                active={values.schedule}
                onChange={(schedule) => update("schedule", schedule)}
                style={styles.quickPresetScroll}
                testIDPrefix="group-form-schedule"
              />
            </Section>

            <Section label="모임 장소" required>
              <FormInput
                accessibilityLabel="소모임 장소"
                value={values.location}
                onChangeText={(location) => update("location", location)}
                placeholder="예: 교육관 2층"
              />
              <FilterChips
                key={presetChipsKey(
                  "location",
                  LOCATION_PRESET_ITEMS,
                  values.location,
                )}
                items={LOCATION_PRESET_ITEMS}
                active={values.location}
                onChange={(location) => update("location", location)}
                style={styles.quickPresetScroll}
                testIDPrefix="group-form-location"
              />
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
  chipScroll: {
    flexGrow: 0,
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
