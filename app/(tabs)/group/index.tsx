import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Card,
  ErrorState,
  FloatingActionButton,
  SegmentedTabs,
  VisualCover,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useGroupOverview } from "../../../src/hooks/useGroups";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { GroupOverviewItem } from "../../../src/types/group";

const categories = [
  { key: "all", label: "전체" },
  { key: "bible", label: "성경공부·예배" },
  { key: "pray", label: "기도모임" },
  { key: "volunteer", label: "봉사" },
  { key: "hobby", label: "취미·문화" },
  { key: "sport", label: "운동·건강" },
  { key: "cell", label: "목장" },
  { key: "mission", label: "선교" },
  { key: "etc", label: "기타" },
] as const;

const sections = [
  { key: "groups", label: "소모임" },
  { key: "service", label: "봉사" },
] as const;

const sectionHrefs = {
  groups: "/group",
  service: "/group?section=service",
} as const;
export default function GroupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    section?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useGroupOverview();
  const section = params.section === "service" ? "service" : "groups";
  const isMyFull = variant === "my-full";
  const isError = variant === "network-error" || overview.isError;
  const groups = overview.data?.groups ?? [];
  const serviceItems = overview.data?.services ?? [];
  const myGroups = isError ? [] : groups.filter((group) => group.isJoined);
  const isLoading = overview.isPending && !isError;

  if (isMyFull) {
    return (
      <Screen scroll={false} padded={false} testID="screen-group">
        <View style={styles.root}>
          <View style={styles.topBar}>
            <Text style={styles.title}>내 소모임</Text>
          </View>
          <ScrollView contentContainerStyle={styles.fullList}>
            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : (
              myGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => router.push(`/group/${group.id}`)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false} testID="screen-group">
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Text style={styles.title}>동행</Text>
          <View style={styles.searchButton}>
            <MaterialIcons
              name="search"
              size={22}
              color={theme.colors.inkSoft}
            />
          </View>
        </View>

        <SegmentedTabs
          items={sections}
          active={section}
          onChange={(nextSection) => router.replace(sectionHrefs[nextSection])}
          style={styles.segmented}
          testIDPrefix="group-section"
        />

        <ScrollView contentContainerStyle={styles.body}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : isError ? (
            <ErrorState message="네트워크 연결을 확인하고 다시 시도해주세요." />
          ) : section === "service" ? (
            <View style={styles.serviceList}>
              {serviceItems.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/group/${item.linkedGroupId}`)}
                >
                  <Card style={styles.serviceCard}>
                    <View style={styles.serviceRow}>
                      <VisualThumb
                        size={62}
                        seed={item.coverSeed}
                        icon="volunteer-activism"
                      />
                      <View style={styles.serviceBody}>
                        <View style={styles.serviceMetaRow}>
                          <Badge>{item.statusLabel}</Badge>
                          <Text style={styles.serviceSchedule}>
                            {item.schedule}
                          </Text>
                        </View>
                        <Text style={styles.serviceTitle}>{item.name}</Text>
                        <Text style={styles.serviceDesc}>
                          {item.description}
                        </Text>
                        <Text style={styles.serviceCount}>
                          참여 {item.currentMembers}/{item.maxMembers}명
                        </Text>
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={theme.colors.inkMute}
                      />
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>내 소모임</Text>
                  <Text style={styles.moreText}>전체보기</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mineList}
                  style={styles.mineScroll}
                >
                  {myGroups.map((group) => (
                    <Pressable
                      key={group.id}
                      accessibilityRole="button"
                      style={styles.mineCard}
                      onPress={() => router.push(`/group/${group.id}`)}
                    >
                      <VisualCover height={78} seed={group.coverSeed} />
                      <Text numberOfLines={1} style={styles.mineTitle}>
                        {group.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.mineMeta}>
                        멤버 {group.currentMembers}명 ·{" "}
                        {categoryOf(group.category)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.allSectionTitle}>전체 모임</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categories}
                  style={styles.categoryScroll}
                >
                  {categories.map((category) => {
                    const selected = category.key === "all";
                    return (
                      <View
                        key={category.key}
                        style={[styles.chip, selected ? styles.chipOn : null]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected ? styles.chipTextOn : null,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
                <View style={styles.groupList}>
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onPress={() => router.push(`/group/${group.id}`)}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <FloatingActionButton
          label="개설"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/group-new")}
        />
      </View>
    </Screen>
  );
}

function GroupCard({
  group,
  onPress,
}: {
  group: GroupOverviewItem;
  onPress: () => void;
}) {
  const closed = group.status === "closed";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.groupCard, closed ? styles.closedCard : null]}
    >
      <View style={styles.cardTop}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {group.name}
        </Text>
        <RecruitBadge closed={closed} />
      </View>
      <View style={styles.categoryPill}>
        <Text style={styles.categoryPillText}>
          {categoryOf(group.category)}
        </Text>
      </View>
      <Text numberOfLines={2} style={styles.desc}>
        {group.description}
      </Text>
      <View style={styles.memberRow}>
        <MaterialIcons name="groups" size={14} color={theme.colors.inkMute} />
        <Text style={styles.memberText}>
          현재 <Text style={styles.memberCount}>{group.currentMembers}</Text> /
          최대 {group.maxMembers}
        </Text>
      </View>
    </Pressable>
  );
}

function RecruitBadge({ closed }: { closed: boolean }) {
  return (
    <View style={[styles.badge, closed ? styles.badgeClosed : null]}>
      <Text style={[styles.badgeText, closed ? styles.badgeTextClosed : null]}>
        {closed ? "모집완료" : "모집중"}
      </Text>
    </View>
  );
}

function categoryOf(key: string) {
  return categories.find((category) => category.key === key)?.label ?? "기타";
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.extrabold,
  },
  searchButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  segmented: {
    marginHorizontal: 18,
    marginBottom: 10,
  },
  body: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 6,
  },
  sectionHead: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  allSectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  moreText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  mineScroll: {
    flexGrow: 0,
  },
  mineList: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    gap: 12,
  },
  mineCard: {
    width: 214,
    flexShrink: 0,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
    ...theme.shadow.card,
  },
  mineTitle: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  mineMeta: {
    marginTop: 5,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  categories: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.white,
  },
  groupList: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  serviceList: {
    marginHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  serviceCard: {
    padding: 16,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  serviceBody: {
    flex: 1,
    minWidth: 0,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  serviceSchedule: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  serviceTitle: {
    marginTop: 7,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
  },
  serviceDesc: {
    marginTop: 5,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  serviceCount: {
    marginTop: 8,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  fullList: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 12,
  },
  loading: {
    paddingTop: 80,
    alignItems: "center",
  },
  groupCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.card,
  },
  closedCard: {
    opacity: 0.5,
  },
  cardTop: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    lineHeight: 22,
    fontWeight: theme.fontWeight.bold,
  },
  badge: {
    flexShrink: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(143,168,130,0.20)",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeClosed: {
    backgroundColor: "rgba(30,41,32,0.06)",
  },
  badgeText: {
    color: "#4F6B45",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  badgeTextClosed: {
    color: theme.colors.inkMute,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  desc: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 21,
  },
  memberRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  memberCount: {
    color: theme.colors.primaryDeep,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
  },
});
