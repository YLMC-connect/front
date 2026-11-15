import { RadioRow } from "@/components/ui/checkbox";
import { InfoBox } from "@/components/ui/info-box";
import { ModalFormTextInput } from "@/components/ui/modal-form-layout";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import { Badge, FloatingBottomBar, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useMemberMe } from "../../../src/hooks/useMember";
import { useCreatePrayerApplication } from "../../../src/hooks/usePrayers";

const days = ["월", "화", "수", "목", "금", "토"] as const;
const dayToYoil: Record<(typeof days)[number], number> = {
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};
const dayNames: Record<(typeof days)[number], string> = {
  월: "월요일",
  화: "화요일",
  수: "수요일",
  목: "목요일",
  금: "금요일",
  토: "토요일",
};
const times = ["오전", "오후"] as const;

export default function PrayerApplyScreenRoute() {
  const router = useRouter();
  const { data: member } = useMemberMe();
  const [selectedDay, setSelectedDay] = useState<(typeof days)[number]>("월");
  const [selectedTime, setSelectedTime] =
    useState<(typeof times)[number]>("오전");
  const [memo, setMemo] = useState("");
  const createApplication = useCreatePrayerApplication();
  const selectedLabel = `${dayNames[selectedDay]} ${selectedTime} 기도방`;
  const memberName = member?.name ?? "";
  const memberPhone = member?.phone ?? "";

  const handleSubmit = () => {
    if (!memberName || !memberPhone) {
      Alert.alert(
        "신청자 정보 없음",
        "이름 또는 전화번호를 불러오지 못했어요. 잠시 후 다시 시도하거나 마이페이지에서 전화번호를 등록해주세요.",
      );
      return;
    }
    createApplication.mutate(
      {
        yoil: dayToYoil[selectedDay],
        timeSlot: selectedTime === "오전" ? "AM" : "PM",
        applicantName: memberName,
        applicantPhone: memberPhone,
        applyMemo: memo.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("신청 완료", `${selectedLabel} 참여를 신청했어요.`, [
            { text: "확인", onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert(
            "신청 실패",
            err instanceof Error
              ? err.message
              : "기도방 참여를 신청하지 못했어요. 다시 시도해주세요.",
          );
        },
      },
    );
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="기도방 참여 신청" close onBack={() => router.back()} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.body, { flexGrow: 1 }]}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={{ flexGrow: 1 }}
          >
            <InfoBox
              description="요일을 고른 뒤 오전·오후 중 하나를 선택해 주세요. 승인 전에는 기도제목을 볼 수 없어요."
              style={styles.notice}
            />

            <View style={styles.stack}>
              <View>
                <Text style={styles.sectionLabel}>1. 요일 선택</Text>
                <View style={styles.optionStack}>
                  {days.map((day) => (
                    <RadioRow
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
                    <RadioRow
                      accessibilityLabel={`${time} 기도방`}
                      key={time}
                      label={`${time} 기도방`}
                      onPress={() => setSelectedTime(time)}
                      selected={time === selectedTime}
                      style={styles.timeOption}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>신청자 정보</Text>
                <Field label="이름" value={memberName || "-"} />
                <Field
                  label="연락처"
                  value={memberPhone || "등록된 전화번호 없음"}
                />
                <View>
                  <Text style={styles.fieldLabel}>신청 메모</Text>
                  <ModalFormTextInput
                    accessibilityLabel="신청 메모"
                    editable={!createApplication.isPending}
                    multiline
                    onChangeText={setMemo}
                    placeholder="기도방 참여를 희망하는 이유를 적어주세요"
                    style={styles.input}
                    value={memo}
                  />
                </View>
              </View>

              <View style={styles.waitingCard}>
                <View style={styles.waitingHead}>
                  <Badge tone="warning">승인 대기</Badge>
                  <Text style={styles.waitingTitle}>
                    한 번 신청하면 다시 신청할 수 없어요
                  </Text>
                </View>
                <Text style={styles.waitingText}>
                  중보기도 관리자가 승인하면 내 기도방에 보여요.
                </Text>
              </View>
            </View>
          </Pressable>
        </ScrollView>

        <FloatingBottomBar
          disabled={createApplication.isPending}
          label={`${selectedLabel} 신청하기`}
          loading={createApplication.isPending}
          onPress={handleSubmit}
          testID="prayer-apply"
        />
      </View>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ModalFormTextInput
        accessibilityLabel={label}
        editable={false}
        style={styles.input}
        value={value}
      />
    </View>
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
  },
  stack: {
    gap: 18,
  },
  sectionLabel: {
    marginBottom: 8,
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  optionStack: {
    gap: 8,
  },
  timeGrid: {
    flexDirection: "row",
    gap: 10,
  },
  timeOption: {
    flex: 1,
  },
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 15,
    gap: 12,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  fieldLabel: {
    marginBottom: 6,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.typography.label.fontWeight,
  },
  input: {
    marginHorizontal: 0,
  },
  waitingCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  waitingHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waitingTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  waitingText: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
