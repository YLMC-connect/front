import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ModalFormSection as Section,
  SectionDivider as Divider,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { readDesignVariant } from "../../src/lib/designVariant";

const categories = [
  "성경공부·예배",
  "기도모임",
  "봉사",
  "취미·문화",
  "운동·건강",
  "목장",
  "선교",
  "기타",
] as const;

const filledValues = {
  name: "토요 산악회",
  description:
    "매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.\n등산 초보도 환영해요. 등산화·물·간식만 챙겨오시면 돼요.",
};

export default function GroupNewModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit = ["edit", "range-error", "member-error"].includes(variant);
  const isFilled = isEdit || variant === "create-filled";
  const isRangeError = variant === "range-error";
  const isMemberError = variant === "member-error";
  const name = isFilled ? filledValues.name : "";
  const description = isFilled ? filledValues.description : "";
  const capacity = isRangeError
    ? "150"
    : isMemberError
      ? "15"
      : isFilled
        ? "25"
        : "";

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={22} color={theme.colors.inkSoft} />
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
        <Text style={styles.topTitle}>
          {isEdit ? "소모임 수정" : "소모임 개설"}
        </Text>
        <Text style={[styles.doneText, !isFilled ? styles.doneDisabled : null]}>
          완료
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Section label="카테고리" required>
          <View style={styles.chips}>
            {categories.map((category) => {
              const selected = isFilled && category === "운동·건강";
              return (
                <View
                  key={category}
                  style={[styles.chip, selected ? styles.chipOn : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected ? styles.chipTextOn : null,
                    ]}
                  >
                    {category}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Divider />

        <Section label="소모임명" required hint={`${name.length}/20`}>
          <TextInput
            editable={false}
            value={name}
            placeholder="소모임 이름을 입력해주세요 (최대 20자)"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.input}
          />
        </Section>

        <Divider />

        <Section label="설명" required hint={`${description.length}/200`}>
          <TextInput
            editable={false}
            multiline
            value={description}
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
              editable={false}
              value={capacity}
              placeholder="숫자"
              placeholderTextColor={theme.colors.inkMute}
              style={[
                styles.capacityInput,
                isRangeError || isMemberError ? styles.inputError : null,
              ]}
            />
            <Text style={styles.capacityUnit}>명</Text>
            <Text style={styles.capacityHint}>2~100명</Text>
          </View>
          {isRangeError ? (
            <InlineError>2~100명 사이로 입력해주세요</InlineError>
          ) : null}
          {isMemberError ? (
            <InlineError>
              현재 멤버수(18명)보다 적게 설정할 수 없습니다
            </InlineError>
          ) : null}
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
      </ScrollView>
    </View>
  );
}

function InlineError({ children }: { children: ReactNode }) {
  return (
    <View style={styles.errorRow}>
      <MaterialIcons
        name="error-outline"
        size={14}
        color={theme.colors.danger}
      />
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  closeButton: {
    minWidth: 70,
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
  doneText: {
    minWidth: 70,
    textAlign: "right",
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  doneDisabled: {
    color: theme.colors.inkHint,
  },
  body: {
    paddingBottom: 24,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 22,
  },
  chip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  chipTextOn: {
    color: theme.colors.white,
  },
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
  textarea: {
    minHeight: 132,
    paddingTop: 12,
    lineHeight: 22,
  },
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
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: "#FDF4F1",
  },
  capacityUnit: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
  },
  capacityHint: {
    marginLeft: "auto",
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  errorRow: {
    marginHorizontal: 22,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  infoBox: {
    marginHorizontal: 22,
    marginTop: 22,
    marginBottom: 22,
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
});
