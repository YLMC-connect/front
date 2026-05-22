import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../src/components/layout/Screen";
import {
  Avatar,
  Card,
  EmptyState,
  Skeleton,
  TopBar,
} from "../../src/components/ui";
import { GroupCard } from "../../src/components/group/GroupCard";
import { MarketItemCard } from "../../src/components/market/MarketItemCard";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useHome } from "../../src/hooks/useHome";

export default function HomeScreen() {
  const { currentUser } = useAuth();
  const { data, isLoading, isError } = useHome();

  return (
    <Screen>
      <TopBar
        testID="screen-home"
        title="열린문 커넥트"
        subtitle={
          currentUser
            ? `${currentUser.name}님, 평안하세요`
            : "성도와 성도를 이어요"
        }
        right={<Avatar name={currentUser?.name ?? "?"} size={38} />}
      />

      <Card style={styles.noticeCard}>
        <View style={styles.noticeIcon}>
          <MaterialIcons name="campaign" size={24} color="#fff" />
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
          <View style={styles.quickGrid}>
            <QuickLink
              href="/market"
              icon="redeem"
              title="나눔"
              desc="필요한 물품을 나눠요"
            />
            <QuickLink
              href="/group"
              icon="groups"
              title="소모임"
              desc="함께할 모임을 찾아요"
            />
            <QuickLink
              href="/life-study"
              icon="menu-book"
              title="삶공부"
              desc="과정을 신청해요"
            />
            <QuickLink
              href="/prayer"
              icon="volunteer-activism"
              title="중보기도"
              desc="함께 기도해요"
            />
            <QuickLink
              href="/mypage"
              icon="person"
              title="MY"
              desc="내 활동을 확인해요"
            />
          </View>

          <Section title="최근 나눔">
            <View style={styles.stack}>
              {data?.recentMarketItems.slice(0, 2).map((item) => (
                <MarketItemCard key={item.id} item={item} />
              ))}
            </View>
          </Section>

          <Section title="추천 소모임">
            <View style={styles.stack}>
              {data?.recommendedGroups.slice(0, 2).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </View>
          </Section>
        </>
      )}
    </Screen>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.quickCard}>
        <MaterialIcons name={icon} size={26} color={theme.colors.primaryDeep} />
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDesc}>{desc}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  noticeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
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
  noticeTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  noticeSummary: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    lineHeight: 18,
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: {
    width: "48%",
    minHeight: 112,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  quickTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: "900" },
  quickDesc: { color: theme.colors.inkMute, fontSize: 12, lineHeight: 17 },
  stack: { gap: 12 },
});
