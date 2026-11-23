import { AppIcon } from "@/components/ui/app-icon";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { theme } from "../../constants/theme";
import type { PrayerPeriod, PrayerWeekday } from "../../types/prayer";
import {
  AppText,
  FloatingActionButton,
  ListSkeleton,
  MotionEnter,
  MotionPressable,
} from "../ui";
import { periodLabels, weekdayLabels } from "./faithLabels";
import { styles } from "./faithSectionsStyles";

export function OverviewLoading() {
  return (
    <View style={styles.overviewState}>
      <ListSkeleton rows={3} thumbnail={false} />
    </View>
  );
}

export function PrayerDayBadge({
  weekday,
  period,
}: {
  weekday: PrayerWeekday;
  period: PrayerPeriod;
}) {
  return (
    <View style={styles.dayBadge}>
      <Text style={styles.dayText}>{weekdayLabels[weekday].short}</Text>
      <Text style={styles.timeText}>{periodLabels[period]}</Text>
    </View>
  );
}

export function PrayerFloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <Pressable
          accessibilityLabel="메뉴 닫기"
          accessibilityRole="button"
          onPress={() => setOpen(false)}
          style={styles.fabBackdrop}
          testID="prayer-fab-backdrop"
        />
      ) : null}
      <View pointerEvents="box-none" style={styles.fabContainer}>
        {open ? (
          <View style={styles.fabMenu}>
            <MotionEnter delay={40} mode="fadeUp">
              <MotionPressable
                accessibilityLabel="중보기도 신청"
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push("/prayer/apply");
                }}
                hitSlop={{ top: 3, bottom: 3 }}
                style={styles.fabMenuItem}
                testID="prayer-fab-apply-item"
              >
                <AppIcon
                  name="prayer-apply"
                  size={18}
                  color={theme.colors.primaryStrong}
                />
                <AppText variant="caption" style={styles.fabMenuItemText}>
                  중보기도 신청
                </AppText>
              </MotionPressable>
            </MotionEnter>

            <MotionEnter delay={0} mode="fadeUp">
              <MotionPressable
                accessibilityLabel="기도제목 작성"
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push("/modal/prayer-new");
                }}
                hitSlop={{ top: 3, bottom: 3 }}
                style={styles.fabMenuItem}
                testID="prayer-fab-write-item"
              >
                <AppIcon
                  name="edit"
                  size={18}
                  color={theme.colors.primaryStrong}
                />
                <AppText variant="caption" style={styles.fabMenuItemText}>
                  기도제목 작성
                </AppText>
              </MotionPressable>
            </MotionEnter>
          </View>
        ) : null}

        <FloatingActionButton
          accessibilityLabel={open ? "기도 신청 메뉴 닫기" : "기도 신청 메뉴"}
          icon={open ? "close" : "add"}
          label={open ? "닫기" : "신청 및 작성"}
          onPress={() => setOpen((prev) => !prev)}
          style={styles.fabButton}
          testID="prayer-fab-toggle"
        />
      </View>
    </>
  );
}
