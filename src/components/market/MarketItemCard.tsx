import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Badge, VisualThumb } from "../ui";
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
        <View style={styles.card}>
          <View style={styles.thumb}>
            {item.images[0] ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.thumbImage}
                contentFit="cover"
              />
            ) : (
              <VisualThumb size={86} seed={Number(item.id) || 0} />
            )}
            {item.status === "done" ? (
              <View style={styles.doneOverlay}>
                <Text style={styles.doneText}>나눔완료</Text>
              </View>
            ) : null}
            {item.status === "reserved" ? (
              <View style={styles.reservedBadge}>
                <Text style={styles.reservedText}>예약중</Text>
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.body,
              item.status === "done" ? styles.doneBody : null,
            ]}
          >
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
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  thumb: {
    width: 86,
    height: 86,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.sage,
  },
  thumbImage: { width: "100%", height: "100%" },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.55)",
  },
  doneText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  reservedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.amberSoft,
  },
  reservedText: { color: "#8A5A1F", fontWeight: "900", fontSize: 10 },
  body: { flex: 1, minWidth: 0, gap: 7, justifyContent: "space-between" },
  doneBody: { opacity: 0.58 },
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
