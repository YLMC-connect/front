import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-prayer"
        title="중보기도"
        subtitle="요일별 기도방에서 함께 기도합니다"
      />
      <HorizontalChips
        items={PRAYER_WEEKDAY_TABS}
        active={weekday}
        onChange={setWeekday}
      />

      <View style={styles.content}>
        <Section title="내 기도방">
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

        <Section title="요일별 기도방">
          <View style={styles.stack}>
            {isError ? (
              <ErrorState />
            ) : isLoading ? (
              <Text style={styles.loading}>기도방을 불러오는 중입니다.</Text>
            ) : data.length === 0 ? (
              <EmptyState title="기도방이 없습니다" icon="volunteer-activism" />
            ) : (
              data.map((room) => <PrayerRoomCard key={room.id} room={room} />)
            )}
          </View>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, gap: 18 },
  stack: { gap: 12 },
  loading: { color: theme.colors.inkMute },
});
