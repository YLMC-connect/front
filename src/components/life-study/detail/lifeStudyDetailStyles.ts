import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  bodyNoBottomBar: {
    paddingBottom: 24,
  },
  hero: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  caption: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  infoCard: {
    marginTop: 14,
    padding: 14,
    gap: 9,
  },
  infoTitle: {
    marginBottom: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
    textAlign: "right",
  },
  primaryText: {
    color: theme.colors.primaryStrong,
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  stack: {
    marginTop: 12,
    gap: 10,
  },
  noticeCard: {
    padding: 14,
    gap: 8,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noticeCardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  noticeCardText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticeTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  divider: {
    marginTop: 18,
    height: 8,
    backgroundColor: theme.colors.bg,
  },
  progressCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  progressHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  progressValue: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  progressTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  metric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 10,
  },
  metricValue: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  nextClass: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 12,
  },
  nextText: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  weekText: {
    width: 48,
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  assignmentCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  assignmentTitle: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: 24,
  },
  curriculumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  weekBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekBadgeDone: {
    backgroundColor: theme.colors.primarySubtle,
  },
  weekBadgeCurrent: {
    backgroundColor: theme.colors.primary,
  },
  weekNumber: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  weekNumberOn: {
    color: theme.colors.onPrimary,
  },
  curriculumTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.medium,
  },
  doneText: {
    color: theme.colors.textMuted,
  },
  sectionMargin: {
    marginTop: 24,
  },
  sectionMarginFill: {
    flex: 1,
  },
  subSectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 8,
  },
});
