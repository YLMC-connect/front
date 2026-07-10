import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Card,
  ErrorState,
  FloatingActionButton,
  VisualCover,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

const categories = [
  { key: "all", label: "전체" },
  { key: "bible", label: "성경공부·예배" },
  { key: "pray", label: "기도모임" },
  { key: "volun", label: "봉사" },
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

const groups = [
  {
    id: "1",
    name: "토요 산악회",
    cat: "sport",
    desc: "매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다. 등산 초보도 환영해요.",
    cur: 18,
    max: 25,
    status: "open",
    seed: 0,
  },
  {
    id: "2",
    name: "독서 나눔",
    cat: "hobby",
    desc: "매월 한 권의 책을 함께 읽고 나눠요. 신앙서부터 에세이까지 다양하게 선정합니다.",
    cur: 12,
    max: 15,
    status: "open",
    seed: 1,
  },
  {
    id: "3",
    name: "엄마들의 수다방",
    cat: "cell",
    desc: "아이 키우는 엄마들이 일상과 신앙을 나누는 따뜻한 공간입니다.",
    cur: 24,
    max: 30,
    status: "open",
    seed: 3,
  },
  {
    id: "4",
    name: "화요 새벽기도회",
    cat: "pray",
    desc: "화요일 새벽 5시 30분, 함께 무릎 꿇는 자리. 한 주를 기도로 시작해요.",
    cur: 32,
    max: 50,
    status: "open",
    seed: 2,
  },
  {
    id: "5",
    name: "어르신 돌봄 봉사",
    cat: "volun",
    desc: "한 달에 두 번 인근 요양원을 방문해 어르신들과 시간을 보내요.",
    cur: 8,
    max: 12,
    status: "open",
    seed: 4,
  },
  {
    id: "6",
    name: "찬양 동아리",
    cat: "hobby",
    desc: "함께 찬양하고 연주하며 마음을 모아요. 매주 금요일 저녁 7시에 모입니다.",
    cur: 15,
    max: 15,
    status: "closed",
    seed: 5,
  },
] as const;

const serviceItems = [
  {
    id: "service-1",
    name: "주방 봉사팀",
    desc: "주일 점심 준비와 정리를 함께 섬깁니다.",
    schedule: "주일 10:30",
    cur: 18,
    max: 24,
    status: "모집중",
    seed: 2,
  },
  {
    id: "service-2",
    name: "성가대 신입 모집",
    desc: "찬양으로 예배를 섬길 성도를 기다립니다.",
    schedule: "주일 08:40",
    cur: 5,
    max: 10,
    status: "모집중",
    seed: 5,
  },
  {
    id: "service-3",
    name: "어르신 돌봄 봉사",
    desc: "월 2회 인근 요양원을 방문해 교제합니다.",
    schedule: "둘째·넷째 토요일",
    cur: 8,
    max: 12,
    status: "모집중",
    seed: 4,
  },
] as const;

export default function GroupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    section?: string;
    designVariant?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const section = params.section === "service" ? "service" : "groups";
  const isMyFull = variant === "my-full";
  const isError = variant === "network-error";
  const myGroups = isError
    ? []
    : groups.filter((group) => ["1", "2", "3"].includes(group.id));

  if (isMyFull) {
    return (
      <Screen scroll={false} padded={false} testID="screen-group">
        <View style={styles.root}>
          <View style={styles.topBar}>
            <Text style={styles.title}>내 소모임</Text>
          </View>
          <ScrollView contentContainerStyle={styles.fullList}>
            {myGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => router.push(`/group/${group.id}`)}
              />
            ))}
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

        <View style={styles.segmented}>
          {sections.map((item) => {
            const selected = item.key === section;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={selected ? { selected: true } : {}}
                onPress={() =>
                  router.replace(
                    item.key === "service"
                      ? "/group?section=service"
                      : "/group",
                  )
                }
                style={[styles.segment, selected ? styles.segmentOn : null]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected ? styles.segmentTextOn : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {isError ? (
            <ErrorState message="네트워크 연결을 확인하고 다시 시도해주세요." />
          ) : section === "service" ? (
            <View style={styles.serviceList}>
              {serviceItems.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push("/group/5")}
                >
                  <Card style={styles.serviceCard}>
                    <View style={styles.serviceRow}>
                      <VisualThumb
                        size={62}
                        seed={item.seed}
                        icon="volunteer-activism"
                      />
                      <View style={styles.serviceBody}>
                        <View style={styles.serviceMetaRow}>
                          <Badge>{item.status}</Badge>
                          <Text style={styles.serviceSchedule}>
                            {item.schedule}
                          </Text>
                        </View>
                        <Text style={styles.serviceTitle}>{item.name}</Text>
                        <Text style={styles.serviceDesc}>{item.desc}</Text>
                        <Text style={styles.serviceCount}>
                          참여 {item.cur}/{item.max}명
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
                      <VisualCover height={78} seed={group.seed} />
                      <Text numberOfLines={1} style={styles.mineTitle}>
                        {group.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.mineMeta}>
                        멤버 {group.cur}명 · {categoryOf(group.cat)}
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
  group: (typeof groups)[number];
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
        <Text style={styles.categoryPillText}>{categoryOf(group.cat)}</Text>
      </View>
      <Text numberOfLines={2} style={styles.desc}>
        {group.desc}
      </Text>
      <View style={styles.memberRow}>
        <MaterialIcons name="groups" size={14} color={theme.colors.inkMute} />
        <Text style={styles.memberText}>
          현재 <Text style={styles.memberCount}>{group.cur}</Text> / 최대{" "}
          {group.max}
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ring,
    padding: 4,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  segmentTextOn: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
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
