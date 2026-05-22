import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Badge, Card } from "../ui";
import { theme } from "../../constants/theme";
import type { MarketItem } from "../../types/market";

const statusLabel = {
  sharing: "나눔중",
  reserved: "예약중",
  done: "나눔완료",
} as const;

export function MarketItemCard({ item }: { item: MarketItem }) {
  return (
    <Link href={{ pathname: "/market/[id]", params: { id: item.id } }} asChild>
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.thumb}>
            {item.images[0] ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.thumbImage}
                contentFit="cover"
              />
            ) : (
              <MaterialIcons
                name="redeem"
                size={30}
                color={theme.colors.white}
              />
            )}
          </View>
          <View style={styles.body}>
            <View style={styles.row}>
              <Text numberOfLines={2} style={styles.title}>
                {item.title}
              </Text>
              <Badge
                tone={
                  item.status === "sharing"
                    ? "primary"
                    : item.status === "reserved"
                      ? "warn"
                      : "mute"
                }
              >
                {statusLabel[item.status]}
              </Badge>
            </View>
            <Text numberOfLines={2} style={styles.desc}>
              {item.description}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                {item.owner.name} · {item.location}
              </Text>
              {item.liked ? (
                <MaterialIcons
                  name="favorite"
                  size={16}
                  color={theme.colors.danger}
                />
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, padding: 14 },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.sage,
  },
  thumbImage: { width: "100%", height: "100%" },
  body: { flex: 1, minWidth: 0, gap: 7 },
  row: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  desc: { color: theme.colors.inkSoft, fontSize: 13, lineHeight: 18 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "600" },
});
