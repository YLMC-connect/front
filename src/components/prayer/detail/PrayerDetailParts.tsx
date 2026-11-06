import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import {
  AnimatedProgressFill,
  Avatar,
  Card,
  Empty,
  MotionPressable,
} from "../../ui";
import { theme } from "../../../constants/theme";
import { styles } from "./prayerDetailStyles";

export type TabKey = "pray" | "answers" | "status";

export interface PrayerItemData {
  category: string;
  title: string;
  author: string;
  text: string;
  answer?: string;
  when: string;
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
        desc="새 기도제목이 승인되면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {urgent.length > 0 ? (
        <Section title="긴급 기도제목">
          {urgent.map((item) => (
            <PrayerItem key={item.title} item={item} />
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
          {progress.map((item) => (
            <PrayerItem key={item.title} item={item} />
          ))}
        </Section>
      ) : null}
    </View>
  );
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
        desc="응답완료 처리된 기도제목은 최신순으로 이곳에 표시됩니다."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {items.map((item) => (
        <PrayerItem key={item.title} item={item} answer />
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
            <Text style={styles.smallMuted}>오늘의 기도 참여 현황이에요</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <Stat label="완료" value={completedText} active />
          <Stat label="미완료" value={pendingText} />
          <Stat label="참여율" value={rateText} />
        </View>
        <View style={styles.progressBar}>
          <AnimatedProgressFill
            percent={empty ? 0 : completionRate}
            style={styles.progressFill}
          />
        </View>
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
            desc="기도방 참여자가 생기면 완료 여부가 이곳에 표시됩니다."
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
          <Text style={styles.dot}>·</Text>
          <Text style={styles.smallMuted}>{item.when}</Text>
        </View>

        <View style={styles.chipRow}>
          {item.urgent ? (
            <View style={styles.urgentBadge}>
              <AppIcon
                name="warning-amber"
                size={10}
                color={theme.colors.dangerText}
              />
              <Text style={styles.urgentBadgeText}>긴급</Text>
            </View>
          ) : null}
          <View
            style={[
              styles.topicChip,
              item.urgent ? styles.topicChipWarn : null,
            ]}
          >
            <Text
              style={[
                styles.topicChipText,
                item.urgent ? styles.topicChipTextWarn : null,
              ]}
            >
              {item.category}
            </Text>
          </View>
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
      <View
        style={[
          styles.personBadge,
          done ? styles.personBadgeDone : styles.personBadgePending,
        ]}
      >
        <AppIcon
          name={done ? "check" : "schedule"}
          size={11}
          color={done ? theme.colors.primaryStrong : theme.colors.textMuted}
        />
        <Text
          style={[
            styles.personBadgeText,
            done ? styles.personBadgeTextDone : styles.personBadgeTextPending,
          ]}
        >
          {done ? "완료" : "대기"}
        </Text>
      </View>
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
