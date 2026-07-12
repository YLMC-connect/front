import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Button,
  ConfirmDialog,
  ModalFormSection as Section,
  SectionDivider as Divider,
} from "../../src/components/ui";
import { GROUP_CATEGORIES } from "../../src/constants/domainOptions";
import { theme } from "../../src/constants/theme";
import { useCreateGroup } from "../../src/hooks/useGroups";
import { readDesignVariant } from "../../src/lib/designVariant";
import type { GroupInput } from "../../src/types/group";

const categories = GROUP_CATEGORIES.slice(1) as readonly {
  key: GroupInput["category"];
  label: string;
}[];

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
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit = ["edit", "range-error", "member-error"].includes(variant);
  const useFilledValues = isEdit || variant === "create-filled";
  const initialValues = useMemo<GroupInput>(
    () => ({
      ...(useFilledValues ? filledValues : emptyValues),
      maxMembers:
        variant === "range-error"
          ? 150
          : variant === "member-error"
            ? 15
            : useFilledValues
              ? filledValues.maxMembers
              : emptyValues.maxMembers,
    }),
    [useFilledValues, variant],
  );
  const [values, setValues] = useState(initialValues);
  const [capacity, setCapacity] = useState(String(initialValues.maxMembers));
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const createGroup = useCreateGroup();
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const update = <Key extends keyof GroupInput>(
    key: Key,
    value: GroupInput[Key],
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
      const created = await createGroup.mutateAsync(values);
      router.replace(`/group/${created.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "소모임을 개설하지 못했습니다.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="소모임 개설 닫기"
          accessibilityRole="button"
          onPress={close}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={22} color={theme.colors.inkSoft} />
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
        <Text style={styles.topTitle}>
          {isEdit ? "소모임 수정" : "소모임 개설"}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
      >
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

        <Divider />

        <Section label="소모임명" required hint={`${values.name.length}/20`}>
          <TextInput
            accessibilityLabel="소모임 이름"
            value={values.name}
            onChangeText={(name) => update("name", name)}
            maxLength={20}
            placeholder="소모임 이름을 입력해주세요 (최대 20자)"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.input}
          />
        </Section>

        <Divider />

        <Section
          label="설명"
          required
          hint={`${values.description.length}/200`}
        >
          <TextInput
            accessibilityLabel="소모임 설명"
            multiline
            value={values.description}
            onChangeText={(description) => update("description", description)}
            maxLength={200}
            placeholder="어떤 소모임인지, 어떻게 모이는지 알려주세요"
            placeholderTextColor={theme.colors.inkMute}
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
          />
        </Section>

        <Divider />

        <Section label="최대인원" required>
          <View style={styles.capacityRow}>
            <TextInput
              accessibilityLabel="소모임 최대인원"
              keyboardType="number-pad"
              value={capacity}
              onChangeText={(text) => {
                setCapacity(text);
                update("maxMembers", Number(text) || 0);
              }}
              placeholder="숫자"
              placeholderTextColor={theme.colors.inkMute}
              style={styles.capacityInput}
            />
            <Text style={styles.capacityUnit}>명</Text>
            <Text style={styles.capacityHint}>2~100명</Text>
          </View>
          {variant === "range-error" ? (
            <Text style={styles.inlineError}>2~100명 사이로 입력해주세요</Text>
          ) : null}
          {variant === "member-error" ? (
            <Text style={styles.inlineError}>
              현재 멤버수(18명)보다 적게 설정할 수 없습니다
            </Text>
          ) : null}
        </Section>

        <Divider />

        <Section label="모임 일정" required>
          <TextInput
            accessibilityLabel="소모임 일정"
            value={values.schedule}
            onChangeText={(schedule) => update("schedule", schedule)}
            placeholder="예: 매주 토요일 오전 10시"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.input}
          />
        </Section>

        <Divider />

        <Section label="모임 장소" required>
          <TextInput
            accessibilityLabel="소모임 장소"
            value={values.location}
            onChangeText={(location) => update("location", location)}
            placeholder="예: 교육관 2층"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.input}
          />
        </Section>

        <View style={styles.infoBox}>
          <MaterialIcons
            name="info"
            size={16}
            color={theme.colors.primaryDeep}
          />
          <Text style={styles.infoText}>
            비슷한 목적의 소모임이 이미 있다면 기존 소모임 참여를 먼저
            고려해주세요.
          </Text>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={submit} loading={createGroup.isPending}>
          {isEdit ? "변경사항 저장" : "소모임 개설"}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  topBar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  closeButton: {
    minWidth: 70,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  closeText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  topSpacer: { width: 70 },
  body: { paddingBottom: 24 },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 22,
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
  input: {
    minHeight: 48,
    marginHorizontal: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  textarea: { minHeight: 132, paddingTop: 12, lineHeight: 22 },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
  },
  capacityInput: {
    width: 120,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    textAlign: "center",
  },
  capacityUnit: { color: theme.colors.inkSoft, fontSize: theme.fontSize.md },
  capacityHint: {
    marginLeft: "auto",
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  inlineError: {
    marginHorizontal: 22,
    marginTop: 8,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  infoBox: {
    marginHorizontal: 22,
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
    marginHorizontal: 22,
    marginTop: 12,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },
});
