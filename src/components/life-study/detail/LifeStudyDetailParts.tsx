import { AppIcon } from "@/components/ui/app-icon";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { AnimatedProgressFill, Card, DetailBadge } from "../../ui";
import { theme } from "../../../constants/theme";
import {
  assignments,
  curriculum,
  notices,
  schedule,
} from "./lifeStudyDetailData";
import { styles } from "./lifeStudyDetailStyles";

export function EnrolledContent() {
  return (
    <>
      <Section title="공지사항">
        {notices.map((notice) => (
          <Card key={notice.title} style={styles.noticeCard}>
            <View style={styles.badgeRow}>
              <DetailBadge bordered tone="warn">
                {notice.scope}
              </DetailBadge>
              <Text style={styles.caption}>{notice.read}</Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
          </Card>
        ))}
      </Section>

      <View style={styles.divider} />

      <Section title="내 진행 상태">
        <View style={styles.progressCard}>
          <View style={styles.progressHead}>
            <Text style={styles.progressLabel}>현재 주차</Text>
            <Text style={styles.progressValue}>4 / 13</Text>
          </View>
          <View style={styles.progressTrack}>
            <AnimatedProgressFill percent={33} style={styles.progressFill} />
          </View>
          <View style={styles.metricGrid}>
            <Metric label="출석" value="4 / 4" />
            <Metric label="숙제" value="3 / 4" />
          </View>
        </View>
      </Section>

      <Section title="이번 수업·출결">
        <Card style={styles.infoCard}>
          <View style={styles.nextClass}>
            <Text style={styles.caption}>다음 수업</Text>
            <Text style={styles.nextText}>
              6.24 수 19:30 · 본당 3층 소예배실
            </Text>
          </View>
          {schedule.map((item, index) => (
            <ScheduleRow
              key={`${item.week}-${item.title}`}
              item={item}
              last={index === schedule.length - 1}
            />
          ))}
        </Card>
      </Section>

      <Section
        title="숙제 확인"
        subtitle="관리자가 확인한 제출 여부만 보여줍니다."
      >
        {assignments.map((item) => (
          <Card key={item.title} style={styles.assignmentCard}>
            <View>
              <Text style={styles.caption}>{item.week}</Text>
              <Text style={styles.assignmentTitle}>{item.title}</Text>
            </View>
            <DetailBadge
              bordered
              tone={item.state === "제출 확인" ? "primary" : "warn"}
            >
              {item.state}
            </DetailBadge>
          </Card>
        ))}
      </Section>
    </>
  );
}

export function ApplyInfo() {
  const rows = [
    ["신청 기간", "6.24 ~ 7.05"],
    ["개강", "2026.07.08"],
    ["시간", "매주 수요일 19:30"],
    ["장소", "본당 3층 소예배실"],
    ["정원", "18 / 24명"],
  ] as const;

  return (
    <Section title="신청 안내">
      <Card style={styles.infoCard}>
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </Card>
    </Section>
  );
}

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

export function InfoRow({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, primary ? styles.primaryText : null]}>
        {value}
      </Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ScheduleRow({
  item,
  last,
}: {
  item: (typeof schedule)[number];
  last: boolean;
}) {
  const tone = item.attendance === "출석" ? "primary" : "warn";
  return (
    <View style={[styles.scheduleRow, !last ? styles.rowBorder : null]}>
      <Text style={styles.weekText}>{item.week}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.caption}>{item.date}</Text>
      </View>
      <DetailBadge
        bordered
        tone={item.attendance === "출석 예정" ? "mute" : tone}
      >
        {item.attendance}
      </DetailBadge>
    </View>
  );
}

export function CurriculumRow({
  item,
  enrolled,
  last,
}: {
  item: (typeof curriculum)[number];
  enrolled: boolean;
  last: boolean;
}) {
  const done = enrolled && item.done;
  const current = enrolled && item.current;

  return (
    <View style={[styles.curriculumRow, !last ? styles.rowBorder : null]}>
      <View
        style={[
          styles.weekBadge,
          done ? styles.weekBadgeDone : null,
          current ? styles.weekBadgeCurrent : null,
        ]}
      >
        {done && !current ? (
          <AppIcon name="check" size={14} color={theme.colors.primaryStrong} />
        ) : (
          <Text
            style={[styles.weekNumber, current ? styles.weekNumberOn : null]}
          >
            {item.week}
          </Text>
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.caption}>WEEK {item.week}</Text>
        <Text
          style={[
            styles.curriculumTitle,
            done && !current ? styles.doneText : null,
          ]}
        >
          {item.title}
        </Text>
      </View>
      {current ? (
        <DetailBadge bordered tone="primary">
          이번주
        </DetailBadge>
      ) : null}
    </View>
  );
}
