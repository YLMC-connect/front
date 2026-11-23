import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    lineHeight: theme.typography.caption.lineHeight,
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
    lineHeight: theme.typography.caption.lineHeight,
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
    lineHeight: theme.typography.caption.lineHeight,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.bold,
    textAlign: "right",
  },
  primaryText: {
    color: theme.colors.primaryStrong,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
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
  weekNumber: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  curriculumTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.medium,
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
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 8,
  },
});
