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
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: theme.fontWeight.extrabold,
  },
  desc: {
    marginTop: 12,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.body,
  },
  infoCard: {
    marginTop: 14,
    padding: 14,
    gap: 9,
  },
  infoTitle: {
    marginBottom: 1,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    textAlign: "right",
  },
  primaryText: {
    color: theme.colors.primaryDeep,
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  noticeCardText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
  },
  noticeTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  divider: {
    marginTop: 18,
    height: 8,
    backgroundColor: "rgba(30,41,32,0.05)",
  },
  progressCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  progressHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  progressValue: {
    color: theme.colors.primaryDeep,
    fontSize: 20,
    fontWeight: theme.fontWeight.extrabold,
  },
  progressTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
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
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    padding: 10,
  },
  metricValue: {
    marginTop: 2,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  nextClass: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    padding: 12,
  },
  nextText: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.extrabold,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  weekText: {
    width: 48,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
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
    backgroundColor: "rgba(30,41,32,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekBadgeDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  weekBadgeCurrent: {
    backgroundColor: theme.colors.primary,
  },
  weekNumber: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  weekNumberOn: {
    color: theme.colors.white,
  },
  curriculumTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  doneText: {
    color: theme.colors.inkMute,
  },
  sectionMargin: {
    marginTop: 24,
  },
  sectionMarginFill: {
    flex: 1,
  },
  subSectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    marginBottom: 8,
  },
});
