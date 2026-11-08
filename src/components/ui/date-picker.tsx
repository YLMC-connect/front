import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { BottomSheet } from "./dialog";
import { MotionFadeIn } from "./motion";
import { Text } from "./text";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY = 36;

function sameDay(a: Date | null | undefined, b: Date) {
  return (
    !!a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 해당 달 달력 칸. 앞쪽 빈칸은 null. */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
  ];
}

/**
 * 디자인 시스템 DatePicker 의 달력 카드. `surface` + 1px `border`, `radius-md`, 안쪽 16.
 * 위 줄 ‹ 월 이름 ›(누르는 곳 44), 요일 12 `text-muted`, 날짜 원 36·14.
 * 오늘은 1.5px `primary` 테두리 + `primary-strong`, 고른 날은 `primary` 채움 + 흰 글자 700.
 */
export function Calendar({
  value,
  onChange,
  today = new Date(),
  testID = "calendar",
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  today?: Date;
  testID?: string;
}) {
  const base = value ?? today;
  const [view, setView] = useState({
    year: base.getFullYear(),
    month: base.getMonth(),
  });
  const move = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  const cells = monthGrid(view.year, view.month);

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="이전 달"
          accessibilityRole="button"
          onPress={() => move(-1)}
          style={styles.nav}
          testID={`${testID}-prev`}
        >
          <AppIcon name="chevron-left" size={20} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.month} testID={`${testID}-month`}>
          {`${view.year}년 ${view.month + 1}월`}
        </Text>
        <Pressable
          accessibilityLabel="다음 달"
          accessibilityRole="button"
          onPress={() => move(1)}
          style={styles.nav}
          testID={`${testID}-next`}
        >
          <AppIcon name="chevron-right" size={20} color={theme.colors.text} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.cell}>
            <Text style={styles.weekday}>{day}</Text>
          </View>
        ))}
      </View>
      <MotionFadeIn key={`${view.year}-${view.month}`} style={styles.grid}>
        {cells.map((date, index) =>
          date ? (
            <View key={index} style={styles.cell}>
              <Pressable
                accessibilityLabel={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                accessibilityRole="button"
                accessibilityState={{ selected: sameDay(value, date) }}
                onPress={() => onChange(date)}
                style={[
                  styles.day,
                  sameDay(today, date) ? styles.dayToday : null,
                  sameDay(value, date) ? styles.daySelected : null,
                ]}
                testID={`${testID}-day-${date.getDate()}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    sameDay(today, date) ? styles.dayTextToday : null,
                    sameDay(value, date) ? styles.dayTextSelected : null,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View key={index} style={styles.cell} />
          ),
        )}
      </MotionFadeIn>
    </View>
  );
}

/** 디자인 시스템 DatePicker. 날짜는 하단 시트 안의 달력으로 고른다. 고르면 닫힌다. */
export function DatePickerSheet({
  visible,
  title = "날짜 선택",
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  title?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <Calendar
        value={value}
        onChange={(date) => {
          onChange(date);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing["4"],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing["2"],
  },
  nav: {
    width: theme.size.buttonHeightSm,
    height: theme.size.buttonHeightSm,
    alignItems: "center",
    justifyContent: "center",
  },
  month: {
    ...theme.typography.body,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 2,
  },
  weekday: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  day: {
    width: DAY,
    height: DAY,
    borderRadius: DAY / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  daySelected: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  dayTextToday: {
    color: theme.colors.primaryStrong,
  },
  dayTextSelected: {
    fontFamily: theme.font.bold,
    fontWeight: "normal",
    color: theme.colors.onPrimary,
  },
});
