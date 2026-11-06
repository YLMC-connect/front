import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

export const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  heroCard: {
    padding: 14,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroMetaCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroProgressSection: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  heroProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroProgressLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  heroProgressRate: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  heroProgressBar: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  bodyWithAction: {
    paddingBottom: 96,
  },
  stack: {
    gap: 12,
  },
  stackSmall: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  prayerCard: {
    padding: 15,
    gap: 10,
  },
  prayerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  dot: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.dangerSubtle,
    borderRadius: theme.radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentBadgeText: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  topicChip: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySubtle,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  topicChipWarn: {
    backgroundColor: theme.colors.warningSubtle,
  },
  topicChipText: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  topicChipTextWarn: {
    color: theme.colors.warningText,
  },
  prayerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  prayerText: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  answerBox: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  answerLabel: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  answerText: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  prayerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  smallMuted: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  pillAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillActionActive: {
    backgroundColor: theme.colors.primarySubtle,
  },
  pillActionText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  pillActionTextActive: {
    color: theme.colors.primaryStrong,
  },
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: 24,
  },
  prayButton: {
    height: 52,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  prayButtonDone: {
    borderWidth: 1,
    borderColor: theme.colors.primarySubtle,
    backgroundColor: theme.colors.primarySubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  prayButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  prayButtonTextDone: {
    color: theme.colors.primaryStrong,
  },
  statusCard: {
    padding: 15,
    gap: 12,
  },
  statusHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusHeadInfo: {
    flex: 1,
    gap: 2,
  },
  dayBadge: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayText: {
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  timeText: {
    marginTop: 2,
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  statusTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.heading.fontSize,
    fontWeight: "900",
  },
  stats: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statActive: {
    backgroundColor: theme.colors.primarySubtle,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  statusListHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusListTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: "900",
  },
  pendingHead: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  personName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  personBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  personBadgeDone: {
    backgroundColor: theme.colors.primarySubtle,
  },
  personBadgePending: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  personBadgeText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  personBadgeTextDone: {
    color: theme.colors.primaryStrong,
  },
  personBadgeTextPending: {
    color: theme.colors.textMuted,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 42,
    gap: 8,
  },
  emptyCompact: {
    backgroundColor: "transparent",
    paddingVertical: 28,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  emptyDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: "center",
  },
});
