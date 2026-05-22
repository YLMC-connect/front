import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge, Card } from "../ui";
import { theme } from "../../constants/theme";
import type { PrayerRoom } from "../../types/prayer";

const weekdayLabel = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
} as const;

const weekdayColors = {
  mon: ["#E0E9DE", "#6B8260"],
  tue: ["#F3E8D7", "#9A7A3D"],
  wed: ["#DDE5CD", "#506B47"],
  thu: ["#E7D2CB", "#883C2D"],
  fri: ["#D8E5DD", "#3F6655"],
} as const;

export function PrayerRoomCard({ room }: { room: PrayerRoom }) {
  const [dayBg, dayFg] = weekdayColors[room.weekday];

  return (
    <Link href={{ pathname: "/prayer/[id]", params: { id: room.id } }} asChild>
      <Pressable>
        <Card style={styles.card}>
          <View style={[styles.dayBox, { backgroundColor: dayBg }]}>
            <Text style={[styles.dayText, { color: dayFg }]}>
              {weekdayLabel[room.weekday]}
            </Text>
          </View>
          <View style={styles.body}>
            <View style={styles.header}>
              <Text style={styles.title}>{room.title}</Text>
              {room.isJoined ? <Badge tone="success">참여중</Badge> : null}
            </View>
            <Text style={styles.meta}>
              {room.leader.name} · 멤버 {room.memberCount}명
            </Text>
          </View>
          {room.isJoined ? (
            <View style={styles.countPill}>
              <Text style={styles.countText}>{room.memberCount}</Text>
            </View>
          ) : (
            <View style={styles.joinPill}>
              <Text style={styles.joinText}>참여</Text>
            </View>
          )}
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, alignItems: "center" },
  dayBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 20, fontWeight: "900" },
  body: { flex: 1, minWidth: 0, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, color: theme.colors.ink, fontSize: 15, fontWeight: "900" },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  countPill: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  joinPill: {
    height: 40,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  joinText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
  },
});
