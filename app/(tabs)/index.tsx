import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../../src/components/layout/Screen";
import {
  Card,
  EmptyState,
  Skeleton,
  VisualCover,
  VisualThumb,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useHome } from "../../src/hooks/useHome";

export default function HomeScreen() {
  const { currentUser } = useAuth();
  const { data, isLoading, isError } = useHome();

  return (
    <Screen>
      <View testID="screen-home" style={styles.homeHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoGlyph}>열</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>열린문 커넥트</Text>
            <Text style={styles.brandSubtitle}>
              {currentUser
                ? `${currentUser.name}님, 평안하세요`
                : "성도와 성도를 이어요"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" style={styles.headerIcon}>
            <MaterialIcons
              name="search"
              size={22}
              color={theme.colors.inkSoft}
            />
          </Pressable>
          <Link href="/notifications" asChild>
            <Pressable accessibilityRole="button" style={styles.headerIcon}>
              <MaterialIcons
                name="notifications-none"
                size={22}
                color={theme.colors.inkSoft}
              />
              {(data?.notificationCount ?? 0) > 0 ? (
                <View style={styles.noticeDot} />
              ) : null}
            </Pressable>
          </Link>
        </View>
      </View>

      <Card style={styles.noticeCard}>
        <View style={styles.noticeIcon}>
          <MaterialIcons name="event-note" size={24} color="#fff" />
        </View>
        <View style={styles.noticeText}>
          <Text style={styles.noticeEyebrow}>이번 주 공지</Text>
          <Text style={styles.noticeTitle}>
            {data?.notices[0]?.title ?? "공지 불러오는 중"}
          </Text>
          <Text style={styles.noticeSummary}>
            {data?.notices[0]?.summary ?? "잠시만 기다려주세요."}
          </Text>
        </View>
        <View style={styles.noticePagers}>
          <View style={[styles.noticePager, styles.noticePagerActive]} />
          <View style={styles.noticePager} />
          <View style={styles.noticePager} />
        </View>
      </Card>

      {isLoading ? (
        <View style={styles.stack}>
          <Skeleton height={92} />
          <Skeleton height={92} />
          <Skeleton height={92} />
        </View>
      ) : isError ? (
        <EmptyState title="홈 데이터를 불러오지 못했습니다" />
      ) : (
        <>
          <Section title="내 소모임 활동" trailing={<MoreLink href="/group" />}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groupRail}
            >
              {data?.recommendedGroups.slice(0, 3).map((group, index) => (
                <Link
                  key={group.id}
                  href={{ pathname: "/group/[id]", params: { id: group.id } }}
                  asChild
                >
                  <Pressable style={styles.groupRailCard}>
                    <VisualCover height={84} seed={index} />
                    <Text numberOfLines={1} style={styles.railTitle}>
                      {group.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.railText}>
                      {group.notices[0]?.title ?? group.schedule}
                    </Text>
                    <Text style={styles.railTime}>{group.schedule}</Text>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          </Section>

          <View style={styles.statsGrid}>
            <FaithStat
              label="오늘 기도제목"
              value="12"
              unit="개"
              caption="월요 새벽기도방"
              icon="volunteer-activism"
            />
            <FaithStat
              label="이번 주 기도응답"
              value="7"
              unit="건"
              caption="지난주 대비 +3"
              icon="favorite-border"
              warm
            />
          </View>

          <Section
            title="새로 생긴 소모임"
            trailing={<MoreLink href="/group" />}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.newGroupRail}
            >
              {data?.recommendedGroups.slice(0, 3).map((group, index) => (
                <Link
                  key={group.id}
                  href={{ pathname: "/group/[id]", params: { id: group.id } }}
                  asChild
                >
                  <Pressable style={styles.newGroupCard}>
                    <VisualCover height={142} seed={index + 1} />
                    <Text numberOfLines={1} style={styles.newGroupTitle}>
                      {group.name}
                    </Text>
                    <View style={styles.newGroupMeta}>
                      <Text style={styles.categoryPill}>{group.category}</Text>
                      <Text style={styles.railTime}>
                        멤버 {group.members.length}명
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          </Section>

          <Section
            title="최근 나눔 물품"
            trailing={<MoreLink href="/market" />}
          >
            <View style={styles.marketGrid}>
              {data?.recentMarketItems.slice(0, 4).map((item, index) => (
                <Link
                  key={item.id}
                  href={{
                    pathname: "/market/[id]",
                    params: { id: item.id },
                  }}
                  asChild
                >
                  <Pressable style={styles.marketTile}>
                    <VisualThumb
                      size={150}
                      seed={index}
                      style={styles.marketThumb}
                    />
                    <Text numberOfLines={1} style={styles.marketTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.marketStatus}>
                      {item.status === "sharing"
                        ? "나눔중"
                        : item.status === "reserved"
                          ? "예약중"
                          : "나눔완료"}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </Section>
        </>
      )}
    </Screen>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Text style={styles.moreText}>전체보기 ›</Text>
      </Pressable>
    </Link>
  );
}

function FaithStat({
  icon,
  label,
  value,
  unit,
  caption,
  warm,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  unit: string;
  caption: string;
  warm?: boolean;
}) {
  return (
    <Card style={[styles.statCard, warm ? styles.statCardWarm : null]}>
      <Text style={[styles.statLabel, warm ? styles.statWarmText : null]}>
        {label}
      </Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, warm ? styles.statWarmStrong : null]}>
          {value}
        </Text>
        <Text style={[styles.statUnit, warm ? styles.statWarmText : null]}>
          {unit}
        </Text>
      </View>
      <Text style={[styles.statCaption, warm ? styles.statWarmText : null]}>
        {caption}
      </Text>
      <MaterialIcons
        name={icon}
        size={48}
        color={warm ? "rgba(122,94,44,0.16)" : theme.colors.primarySoft}
        style={styles.statIcon}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    paddingTop: 8,
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  logoGlyph: { color: "#fff", fontWeight: "900", fontSize: 17 },
  brandTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  brandSubtitle: {
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    borderWidth: 1.5,
    borderColor: theme.colors.bg,
  },
  noticeCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: theme.colors.sage,
    borderWidth: 0,
    padding: 16,
    overflow: "hidden",
  },
  noticeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  noticeText: { flex: 1, gap: 3 },
  noticeEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "800",
  },
  noticeTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  noticeSummary: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    lineHeight: 18,
  },
  noticePagers: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 4,
    marginLeft: 4,
  },
  noticePager: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  noticePagerActive: { backgroundColor: "#fff" },
  moreText: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  groupRail: { gap: 12, paddingRight: 4 },
  groupRailCard: {
    width: 220,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  railTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  railText: { color: theme.colors.inkSoft, fontSize: 12, marginTop: 4 },
  railTime: {
    color: theme.colors.inkMute,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    minHeight: 136,
    padding: 16,
    overflow: "hidden",
  },
  statCardWarm: {
    backgroundColor: theme.colors.amberSoft,
    borderColor: "rgba(122,94,44,0.08)",
  },
  statLabel: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "800" },
  statWarmText: { color: "#7A5E2C" },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  statValue: {
    color: theme.colors.primaryDeep,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 6,
  },
  statWarmStrong: { color: "#5C4419" },
  statUnit: { color: theme.colors.inkSoft, fontSize: 12, fontWeight: "800" },
  statCaption: { color: theme.colors.inkMute, fontSize: 11, marginTop: 8 },
  statIcon: { position: "absolute", right: -6, top: -6 },
  newGroupRail: { gap: 12, paddingRight: 4 },
  newGroupCard: { width: 150 },
  newGroupTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  newGroupMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryPill: {
    color: theme.colors.primaryDeep,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    overflow: "hidden",
  },
  marketGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  marketTile: { width: "48%" },
  marketThumb: { width: "100%", aspectRatio: 1 },
  marketTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  marketStatus: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  stack: { gap: 12 },
});
