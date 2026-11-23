import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  bodyNoBottomBar: {
    paddingBottom: theme.spacing[6],
  },
  skeleton: {
    gap: theme.spacing[3],
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[4],
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[2],
  },
  badgeRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  desc: {
    marginTop: theme.spacing[2],
  },
  infoLines: {
    marginTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSubtle,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  infoLabel: {
    width: 64,
    flexShrink: 0,
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
  },
  notice: {
    marginTop: theme.spacing[5],
  },
  curriculumHead: {
    paddingTop: theme.spacing[6],
  },
  curriculumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: theme.spacing[2],
  },
  push: {
    marginLeft: "auto",
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  lessonWeek: {
    width: 44,
    flexShrink: 0,
  },
  lessonName: {
    flex: 1,
  },
  sectionFill: {
    flex: 1,
  },
  barCaption: {
    textAlign: "center",
    marginTop: -theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
});
