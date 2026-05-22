import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Badge, Card, VisualCover } from "../ui";
import { theme } from "../../constants/theme";
import type { Group } from "../../types/group";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link href={{ pathname: "/group/[id]", params: { id: group.id } }} asChild>
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.cover}>
            {group.coverImage ? (
              <Image
                source={{ uri: group.coverImage }}
                style={styles.coverImage}
                contentFit="cover"
              />
            ) : (
              <VisualCover
                height={88}
                seed={Number(group.id) || 0}
                icon={
                  group.category === "carpool" ? "directions-car" : "groups"
                }
                style={styles.coverFill}
              />
            )}
          </View>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.title}>
              {group.name}
            </Text>
            <Badge tone={group.status === "open" ? "success" : "mute"}>
              {group.status === "open" ? "모집중" : "모집완료"}
            </Badge>
          </View>
          <Text numberOfLines={2} style={styles.desc}>
            {group.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              현재 {group.members.length} / 최대 {group.maxMembers}
            </Text>
            <View style={styles.flags}>
              {group.isJoined ? <Badge tone="primary">참여중</Badge> : null}
              {group.isFavorite ? (
                <MaterialIcons
                  name="star"
                  size={17}
                  color={theme.colors.warn}
                />
              ) : null}
            </View>
          </View>
          <Text style={styles.meta}>{group.schedule}</Text>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  cover: {
    height: 88,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.primaryTint,
  },
  coverImage: { width: "100%", height: "100%" },
  coverFill: { width: "100%" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1, color: theme.colors.ink, fontSize: 17, fontWeight: "800" },
  desc: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flags: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
});
