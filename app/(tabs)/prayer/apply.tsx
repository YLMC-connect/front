import { AppIcon } from "@/components/ui/app-icon";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useCreatePrayerApplication } from "../../../src/hooks/usePrayers";

const days = ["월", "화", "수", "목", "금", "토"] as const;
const dayNames: Record<(typeof days)[number], string> = {
  월: "월요일",
  화: "화요일",
  수: "수요일",
  목: "목요일",
  금: "금요일",
  토: "토요일",
};
const dayYoil = { 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 } as const;
const times = ["오전", "오후"] as const;

export default function PrayerApplyScreenRoute() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<(typeof days)[number]>("월");
  const [selectedTime, setSelectedTime] =
    useState<(typeof times)[number]>("오전");
  const [memo, setMemo] = useState("");
  const apply = useCreatePrayerApplication();
  const selectedLabel = `${dayNames[selectedDay]} ${selectedTime} 기도방`;
  const sent = apply.isSuccess;

  function onSubmit() {
    if (apply.isPending || sent) return;
    const applyMemo = memo.trim();
    apply.mutate({
      yoil: dayYoil[selectedDay],
      timeSlot: selectedTime === "오전" ? "AM" : "PM",
      ...(applyMemo ? { applyMemo } : {}),
    });
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="기도방 참여 신청" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.notice}>
            먼저 요일을 고르고, 그 다음 오전/오후 중 하나를 선택합니다. 승인
            전에는 기도제목을 볼 수 없습니다.
          </Text>

          <View style={styles.stack}>
            <View>
              <Text style={styles.sectionLabel}>1. 요일 선택</Text>
              <View style={styles.optionStack}>
                {days.map((day) => (
                  <SelectRow
                    key={day}
                    label={dayNames[day]}
                    selected={day === selectedDay}
                    onPress={() => setSelectedDay(day)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionLabel}>2. 시간 선택</Text>
              <View style={styles.timeGrid}>
                {times.map((time) => (
                  <Pressable
                    accessibilityRole="button"
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeOption,
                      time === selectedTime ? styles.optionOn : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        time === selectedTime ? styles.optionTextOn : null,
                      ]}
                    >
                      {time === selectedTime ? "✓ " : ""}
                      {time} 기도방
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionLabel}>3. 특이사항</Text>
              <TextInput
                accessibilityLabel="특이사항"
                editable={!apply.isPending && !sent}
                multiline
                onChangeText={setMemo}
                placeholder="비고가 있으면 적어주세요"
                placeholderTextColor={theme.colors.inkHint}
                style={styles.memoInput}
                value={memo}
              />
            </View>

            {sent ? (
              <Text style={styles.result}>신청을 보냈습니다.</Text>
            ) : null}
            {apply.isError ? (
              <Text style={styles.errorText}>
                {apply.error instanceof Error
                  ? apply.error.message
                  : "신청을 보내지 못했습니다."}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: apply.isPending || sent }}
            disabled={apply.isPending || sent}
            onPress={onSubmit}
            style={[
              styles.submitButton,
              apply.isPending || sent ? styles.submitButtonDisabled : null,
            ]}
          >
            <Text style={styles.submitText}>
              {sent
                ? "신청을 보냈습니다"
                : apply.isPending
                  ? "신청을 보내는 중입니다"
                  : `${selectedLabel} 신청하기`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function SelectRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.dayOption, selected ? styles.optionOn : null]}
    >
      <Text style={[styles.optionText, selected ? styles.optionTextOn : null]}>
        {label}
      </Text>
      <View style={styles.selectedTextWrap}>
        {selected ? (
          <AppIcon name="check" size={13} color={theme.colors.primaryDeep} />
        ) : null}
        <Text
          style={[styles.selectedText, selected ? styles.selectedTextOn : null]}
        >
          {selected ? "선택됨" : "선택"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 118,
  },
  notice: {
    marginBottom: 18,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.primaryDeep,
    fontSize: 13,
    lineHeight: 20,
  },
  stack: {
    gap: 18,
  },
  sectionLabel: {
    marginBottom: 8,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  optionStack: {
    gap: 8,
  },
  dayOption: {
    height: 54,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeGrid: {
    flexDirection: "row",
    gap: 10,
  },
  timeOption: {
    flex: 1,
    height: 58,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  optionOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    ...theme.shadow.card,
  },
  optionText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  optionTextOn: {
    color: theme.colors.primaryDeep,
  },
  selectedTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  selectedText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  selectedTextOn: {
    color: theme.colors.primaryDeep,
  },
  memoInput: {
    minHeight: 86,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingTop: 12,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    textAlignVertical: "top",
  },
  result: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  bottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
  },
  submitButton: {
    height: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
