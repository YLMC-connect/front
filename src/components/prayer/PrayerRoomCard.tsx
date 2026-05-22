import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
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

export function PrayerRoomCard({ room }: { room: PrayerRoom }) {
  return (
    <Link href={{ pathname: "/prayer/[id]", params: { id: room.id } }} asChild>
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.icon}>
            <MaterialIcons
              name="volunteer-activism"
              size={28}
              color={theme.colors.danger}
            />
          </View>
          <View style={styles.body}>
            <View style={styles.header}>
              <Text style={styles.title}>{room.title}</Text>
              <Badge tone={room.isJoined ? "success" : "primary"}>
                {room.isJoined ? "참여중" : `${weekdayLabel[room.weekday]}요일`}
              </Badge>
            </View>
            <Text numberOfLines={2} style={styles.desc}>
              {room.description}
            </Text>
            <Text style={styles.meta}>
              {room.leader.name} · {room.memberCount}명 함께 기도
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, alignItems: "center" },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF4F1",
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  desc: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 20 },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
});
