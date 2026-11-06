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
    borderTopColor: theme.colors.line,
  },
  heroProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroProgressLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  heroProgressRate: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
  },
  heroProgressBar: {
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  dot: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
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
    backgroundColor: "rgba(184, 102, 88, 0.12)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentBadgeText: {
    color: theme.colors.danger,
    fontSize: 10,
    fontWeight: theme.fontWeight.extrabold,
  },
  topicChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  topicChipWarn: {
    backgroundColor: theme.colors.amberSoft,
  },
  topicChipText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  topicChipTextWarn: {
    color: theme.colors.warn,
  },
  prayerTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  prayerText: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 20,
  },
  answerBox: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
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
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  answerText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  prayerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  smallMuted: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  pillAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillActionActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  pillActionText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  pillActionTextActive: {
    color: theme.colors.primaryDeep,
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...theme.shadow.primary,
  },
  prayButtonDone: {
    borderWidth: 1,
    borderColor: "rgba(62,104,200,0.22)",
    backgroundColor: theme.colors.primarySoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  prayButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  prayButtonTextDone: {
    color: theme.colors.primaryDeep,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayText: {
    color: theme.colors.primaryDeep,
    fontSize: 15,
    lineHeight: 16,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 2,
    color: theme.colors.primaryDeep,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "800",
  },
  statusTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  stats: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  statLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  statValue: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(30,41,32,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  statusListHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusListTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
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
    borderTopColor: theme.colors.line,
  },
  personName: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  personBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  personBadgeDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  personBadgePending: {
    backgroundColor: theme.colors.surface2,
  },
  personBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  personBadgeTextDone: {
    color: theme.colors.primaryDeep,
  },
  personBadgeTextPending: {
    color: theme.colors.inkMute,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
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
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  emptyDesc: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
    textAlign: "center",
  },
});
