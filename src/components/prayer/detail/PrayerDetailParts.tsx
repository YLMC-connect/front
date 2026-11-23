import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import {
  AppText,
  Avatar,
  Badge,
  Card,
  Empty,
  MotionPressable,
  StaggerItem,
} from "../../ui";
import { ProgressBar } from "../../ui/progress-bar";
import { theme } from "../../../constants/theme";
import { styles } from "./prayerDetailStyles";

export type TabKey = "pray" | "answers" | "status";

export interface PrayerItemData {
  category: string;
  title: string;
  author: string;
  text: string;
  answer?: string;
  /** 서버 날짜가 없으면 비운다. */
  when?: string;
  urgent?: boolean;
}

export function PrayerPanel({
  empty,
  urgent,
  progress,
  answers,
}: {
  empty: boolean;
  urgent: readonly PrayerItemData[];
  progress: readonly PrayerItemData[];
  answers: readonly PrayerItemData[];
}) {
  if (empty) {
    return (
      <EmptyMessage
        icon="hands-pray"
        title="기도할 제목이 없어요"
        desc="새 기도제목이 승인되면 여기에 보여요."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {urgent.length > 0 ? (
        <Section title="긴급 기도제목">
          {urgent.map((item, index) => (
            <StaggerItem key={item.title} index={index}>
              <PrayerItem item={item} />
            </StaggerItem>
          ))}
        </Section>
      ) : null}
      {answers.length > 0 ? (
        <Section title="최근 기도응답">
          {answers.slice(0, 1).map((item) => (
            <PrayerItem key={item.title} item={item} answer />
          ))}
        </Section>
      ) : null}
      {progress.length > 0 ? (
        <Section title="진행 중 기도제목">
          {groupPrayerItemsByCategory(progress).map((group) => (
            <View key={group.category} style={styles.categoryGroup}>
              <View
                accessibilityRole="header"
                style={styles.categoryHeader}
                testID="prayer-category-header"
              >
                <AppText variant="label" weight="semibold">
                  {group.category}
                </AppText>
                <AppText variant="caption" tone="muted" weight="semibold">
                  {group.items.length}
                </AppText>
                <View style={styles.categoryLine} />
              </View>
              {group.items.map((item, index) => (
                <StaggerItem key={`${item.title}-${index}`} index={index}>
                  <PrayerItem item={item} />
                </StaggerItem>
              ))}
            </View>
          ))}
        </Section>
      ) : null}
    </View>
  );
}

/**
 * 진행 중 기도제목을 카테고리 이름순으로 묶는다. 같은 카테고리 안에서는 서버 순서를 지킨다.
 */
export function groupPrayerItemsByCategory(
  items: readonly PrayerItemData[],
): { category: string; items: PrayerItemData[] }[] {
  const groups = new Map<string, PrayerItemData[]>();
  for (const item of items) {
    const list = groups.get(item.category);
    if (list) list.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([category, list]) => ({ category, items: list }));
}

export function AnswersPanel({
  empty,
  items,
}: {
  empty: boolean;
  items: readonly PrayerItemData[];
}) {
  if (empty || items.length === 0) {
    return (
      <EmptyMessage
        icon="check-circle"
        title="응답완료된 기도제목이 없어요"
        desc="응답완료된 기도제목이 최신순으로 여기에 보여요."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {items.map((item, index) => (
        <StaggerItem key={item.title} index={index}>
          <PrayerItem item={item} answer />
        </StaggerItem>
      ))}
    </View>
  );
}

export function StatusPanel({
  empty,
  completedCount,
  pendingCount,
  completionRate,
  completedPeople,
  pendingPeople,
  day,
  period,
}: {
  empty: boolean;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
  completedPeople: readonly string[];
  pendingPeople: readonly string[];
  day: string;
  period: string;
}) {
  const completedText = empty ? "0명" : `${completedCount}명`;
  const pendingText = empty ? "0명" : `${pendingCount}명`;
  const rateText = empty ? "-" : `${completionRate}%`;

  return (
    <View style={styles.stack}>
      <Card style={styles.statusCard}>
        <View style={styles.statusHead}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.timeText}>{period}</Text>
          </View>
          <View style={styles.statusHeadInfo}>
            <Text style={styles.statusTitle}>기도 현황</Text>
            <Text style={styles.smallMuted}>이번 주 기도 참여 현황이에요</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <Stat label="완료" value={completedText} active />
          <Stat label="미완료" value={pendingText} />
          <Stat label="참여율" value={rateText} />
        </View>
        <ProgressBar
          label="이번 주 참여율"
          value={empty ? 0 : completionRate}
          valueText={rateText}
          testID="prayer-status-progress"
        />
      </Card>

      <Card style={styles.statusCard}>
        <View style={styles.statusListHead}>
          <Text style={styles.statusListTitle}>기도 완료한 성도</Text>
          <Text style={styles.smallMuted}>
            {empty ? 0 : completedPeople.length}명
          </Text>
        </View>
        {empty ? (
          <EmptyMessage
            compact
            icon="hands-pray"
            title="기도 완료 현황이 없어요"
            desc="기도방 참여자가 생기면 완료 여부가 여기에 보여요."
          />
        ) : (
          completedPeople.map((name) => (
            <PersonRow key={name} name={name} done />
          ))
        )}
        {!empty && pendingPeople.length > 0 ? (
          <>
            <View style={styles.pendingHead}>
              <Text style={styles.statusListTitle}>아직 완료 전</Text>
              <Text style={styles.smallMuted}>{pendingPeople.length}명</Text>
            </View>
            {pendingPeople.map((name) => (
              <PersonRow key={name} name={name} />
            ))}
          </>
        ) : null}
      </Card>
    </View>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.stackSmall}>{children}</View>
    </View>
  );
}

export function PrayerItem({
  item,
  answer = false,
}: {
  item: PrayerItemData;
  answer?: boolean;
}) {
  const [prayed, setPrayed] = useState(false);

  return (
    <Card style={styles.prayerCard}>
      <View style={styles.prayerTop}>
        <View style={styles.authorRow}>
          <Avatar name={item.author} size={22} />
          <Text style={styles.authorName}>{item.author}</Text>
          {item.when ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.smallMuted}>{item.when}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {item.urgent ? (
            <Badge tone="danger" icon="warning-amber">
              긴급
            </Badge>
          ) : null}
          <Badge tone={item.urgent ? "warning" : "info"}>{item.category}</Badge>
        </View>
      </View>

      <Text style={styles.prayerTitle}>{item.title}</Text>
      <Text style={styles.prayerText}>{item.text}</Text>

      {answer && item.answer ? (
        <View style={styles.answerBox}>
          <View style={styles.answerHeader}>
            <AppIcon
              name="check-circle"
              size={14}
              color={theme.colors.primaryStrong}
            />
            <Text style={styles.answerLabel}>응답</Text>
          </View>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : null}

      <View style={styles.prayerFooter}>
        <MotionPressable
          accessibilityRole="button"
          hitSlop={{ top: 7, bottom: 7 }}
          onPress={() => setPrayed((prev) => !prev)}
          pressedScale={0.94}
          style={[styles.pillAction, prayed ? styles.pillActionActive : null]}
        >
          <AppIcon
            name={answer ? "check" : "favorite"}
            size={14}
            color={
              answer || prayed
                ? theme.colors.primaryStrong
                : theme.colors.textMuted
            }
          />
          <Text
            style={[
              styles.pillActionText,
              prayed ? styles.pillActionTextActive : null,
            ]}
          >
            {answer ? "응답완료" : prayed ? "기도 중" : "함께 기도"}
          </Text>
        </MotionPressable>
      </View>
    </Card>
  );
}

export function PersonRow({
  name,
  done = false,
}: {
  name: string;
  done?: boolean;
}) {
  return (
    <View style={styles.personRow}>
      <Avatar name={name} size={30} />
      <Text style={styles.personName}>{name}</Text>
      <Badge
        tone={done ? "info" : "neutral"}
        icon={done ? "check" : "schedule"}
      >
        {done ? "완료" : "대기"}
      </Badge>
    </View>
  );
}

export function Stat({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.stat, active ? styles.statActive : null]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function EmptyMessage({
  icon,
  title,
  desc,
}: {
  icon: AppIconName;
  title: string;
  desc: string;
  compact?: boolean;
}) {
  return <Empty icon={icon} title={title} description={desc} />;
}
