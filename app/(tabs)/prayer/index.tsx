import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../../src/components/layout/Screen";
import { PrayerRoomCard } from "../../../src/components/prayer/PrayerRoomCard";
import {
  EmptyState,
  ErrorState,
  HorizontalChips,
  TopBar,
} from "../../../src/components/ui";
import { PRAYER_WEEKDAY_TABS } from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import { usePrayerRooms } from "../../../src/hooks/usePrayers";
import type { PrayerWeekday } from "../../../src/types/prayer";

type WeekdayFilter = PrayerWeekday | "all";

export default function PrayerScreen() {
  const [weekday, setWeekday] = useState<WeekdayFilter>("all");
  const { data = [], isLoading, isError } = usePrayerRooms(weekday);
  const joinedRooms = data.filter((room) => room.isJoined);
  const otherRooms = data.filter((room) => !room.isJoined);

  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-prayer"
        title="중보기도"
        subtitle="기도로 함께 동행합니다"
      />
      <HorizontalChips
        items={PRAYER_WEEKDAY_TABS}
        active={weekday}
        onChange={setWeekday}
      />

      <View style={styles.content}>
        <Section title="내 기도모임방">
          {joinedRooms.length === 0 ? (
            <EmptyState
              title="참여 중인 기도방이 없습니다"
              description="기도방을 선택해 참여 신청을 해보세요."
              icon="volunteer-activism"
            />
          ) : (
            <View style={styles.stack}>
              {joinedRooms.map((room) => (
                <PrayerRoomCard key={room.id} room={room} />
              ))}
            </View>
          )}
        </Section>

        <Section title="다른 기도모임방">
          <View style={styles.stack}>
            {isError ? (
              <ErrorState />
            ) : isLoading ? (
              <Text style={styles.loading}>기도방을 불러오는 중입니다.</Text>
            ) : otherRooms.length === 0 ? (
              <EmptyState title="기도방이 없습니다" icon="volunteer-activism" />
            ) : (
              otherRooms.map((room) => (
                <PrayerRoomCard key={room.id} room={room} />
              ))
            )}
          </View>
        </Section>
      </View>
      <Link href="/modal/prayer-new" asChild>
        <Pressable style={styles.fab}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, gap: 18 },
  stack: { gap: 12 },
  loading: { color: theme.colors.inkMute },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 94,
    zIndex: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.5)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
});
