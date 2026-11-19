export const label = "삶공부 수업·출석·수료 API";

export function check({
  requireOperation,
  requireSuccessDataProperties,
  requireRequestFields,
  requireDataArrayItemProperties,
  requireNestedItemProperties,
  requireErrorCodes,
}) {
  const classList = "/api/life-study/cohorts/{cohortId}/classes";
  const attendance = "/api/life-study/classes/{classId}/attendance";
  const attendanceUser = "/api/life-study/classes/{classId}/attendance/user";
  const cohortCompletions = "/api/life-study/cohorts/{cohortId}/completions";
  const completionUser = "/api/life-study/cohorts/{cohortId}/completions/user";
  const myCompletions = "/api/life-study/completions";

  requireOperation("수업일 목록", classList, "get");
  requireSuccessDataProperties("수업일 목록", classList, "get", [
    "cohortId",
    "weekCount",
    "classes",
  ]);
  requireErrorCodes("수업일 목록", classList, "get", ["LST012", "LST001"]);

  requireOperation("출석부 조회", attendance, "get");
  requireErrorCodes("출석부 조회", attendance, "get", ["LST012", "LST006"]);

  requireRequestFields("출석 일괄 저장", attendance, "put", [
    "attendedUserIds",
  ]);
  requireErrorCodes("출석 일괄 저장", attendance, "put", [
    "LST012",
    "LST013",
    "LST014",
    "LST016",
    "LST006",
  ]);

  requireRequestFields("출석 개별 저장", attendanceUser, "put", [
    "userId",
    "attended",
  ]);
  requireErrorCodes("출석 개별 저장", attendanceUser, "put", [
    "LST012",
    "LST013",
    "LST014",
    "LST016",
    "LST006",
  ]);

  const rosterFields = [
    "cohortId",
    "lifeStudyId",
    "lifeStudyName",
    "cohortNumber",
    "totalClassCount",
    "students",
  ];
  const studentFields = [
    "userId",
    "userName",
    "userPhone",
    "attendCount",
    "absentCount",
    "completed",
    "completedAt",
  ];

  requireOperation("수료 현황", cohortCompletions, "get");
  requireSuccessDataProperties(
    "수료 현황",
    cohortCompletions,
    "get",
    rosterFields,
  );
  requireNestedItemProperties(
    "수료 현황",
    cohortCompletions,
    "get",
    "students",
    studentFields,
  );
  requireErrorCodes("수료 현황", cohortCompletions, "get", [
    "LST017",
    "LST001",
  ]);

  requireRequestFields("수료 개별 처리", completionUser, "put", [
    "userId",
    "completed",
  ]);
  requireSuccessDataProperties(
    "수료 개별 처리",
    completionUser,
    "put",
    rosterFields,
  );
  requireNestedItemProperties(
    "수료 개별 처리",
    completionUser,
    "put",
    "students",
    studentFields,
  );
  requireErrorCodes("수료 개별 처리", completionUser, "put", [
    "LST014",
    "LST017",
    "LST001",
  ]);

  requireOperation("내 수료 목록", myCompletions, "get");
  requireDataArrayItemProperties("내 수료 목록", myCompletions, "get", [
    "lifeStudyId",
    "lifeStudyName",
    "cohortId",
    "cohortNumber",
    "attendCount",
    "totalClassCount",
    "completedAt",
  ]);
}
