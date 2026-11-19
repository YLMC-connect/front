export const label = "중보기도 사용자 API";

export function check({
  failures,
  requireOperation,
  requireSuccessDataProperties,
  requireRequestFields,
  requireOptionalRequestFields,
  requireRequestMaxLength,
  requireDataArrayItemProperties,
  requireNestedItemProperties,
  requireDataInteger,
  requireErrorCodes,
}) {
  const myCohorts = "/api/prayer/cohorts/my";
  const openCohorts = "/api/prayer/cohorts/open";
  const cohort = "/api/prayer/cohorts/{cohortId}";
  const cohortStatus = "/api/prayer/cohorts/{cohortId}/status";
  const completion = "/api/prayer/cohorts/{cohortId}/completion";
  const like = "/api/prayer/completions/{completionId}/like";
  const myApplications = "/api/prayer/applications/my";
  const applications = "/api/prayer/applications";
  const application = "/api/prayer/applications/{applicationId}";
  const history = "/api/prayer/me/history";
  const categories = "/api/prayer/categories";
  const board = "/api/prayer/topics/board";
  const myTopics = "/api/prayer/topics/my";
  const topics = "/api/prayer/topics";
  const topic = "/api/prayer/topics/{topicId}";
  const answerRequest = "/api/prayer/topics/{topicId}/answer-request";

  const cohortFields = [
    "id",
    "cohortYear",
    "yoil",
    "timeSlot",
    "cohortName",
    "description",
    "startDate",
    "endDate",
    "status",
    "memberCount",
    "weekCompletedCount",
    "completionRate",
    "myCompleted",
    "myRole",
    "emergencyCount",
  ];
  const statusFields = [
    "cohortId",
    "cohortName",
    "weekStartDate",
    "scheduledDate",
    "totalMembers",
    "completedCount",
    "notCompletedCount",
    "completionRate",
    "myCompleted",
    "canComplete",
    "completed",
    "notCompleted",
  ];
  const memberFields = [
    "userId",
    "userName",
    "userPhone",
    "memberRole",
    "completionId",
    "completedAt",
    "likeCount",
    "liked",
  ];
  const topicFields = [
    "id",
    "categoryId",
    "categoryName",
    "title",
    "content",
    "status",
    "rejectReason",
    "writerName",
    "mine",
    "emergency",
    "emergencyEndAt",
    "answerContent",
    "answeredAt",
    "createdAt",
  ];
  const applicationFields = [
    "id",
    "cohortId",
    "cohortName",
    "yoil",
    "timeSlot",
    "applicantName",
    "applicantPhone",
    "applyMemo",
    "status",
    "rejectReason",
    "createdAt",
    "processedAt",
  ];
  const historyFields = [
    "cohortId",
    "cohortName",
    "cohortYear",
    "yoil",
    "timeSlot",
    "memberRole",
    "joinedAt",
    "leftAt",
    "leaveReason",
    "active",
  ];

  requireOperation("내 기도방", myCohorts, "get");
  requireDataArrayItemProperties("내 기도방", myCohorts, "get", cohortFields);

  requireOperation("신청 가능 기도방", openCohorts, "get");
  requireDataArrayItemProperties(
    "신청 가능 기도방",
    openCohorts,
    "get",
    cohortFields,
  );

  requireOperation("기도방 상세", cohort, "get");
  requireErrorCodes("기도방 상세", cohort, "get", ["PRY001"]);

  requireOperation("이번 주 현황", cohortStatus, "get");
  requireSuccessDataProperties(
    "이번 주 현황",
    cohortStatus,
    "get",
    statusFields,
  );
  requireNestedItemProperties(
    "이번 주 현황",
    cohortStatus,
    "get",
    "completed",
    memberFields,
  );
  requireNestedItemProperties(
    "이번 주 현황",
    cohortStatus,
    "get",
    "notCompleted",
    memberFields,
  );
  requireErrorCodes("이번 주 현황", cohortStatus, "get", ["PRY001"]);

  requireOperation("기도 완료", completion, "post");
  requireSuccessDataProperties("기도 완료", completion, "post", statusFields);
  requireErrorCodes("기도 완료", completion, "post", [
    "PRY012",
    "PRY013",
    "PRY010",
    "PRY001",
    "PRY011",
  ]);

  requireOperation("기도 완료 취소", completion, "delete");
  requireSuccessDataProperties(
    "기도 완료 취소",
    completion,
    "delete",
    statusFields,
  );
  requireErrorCodes("기도 완료 취소", completion, "delete", [
    "PRY010",
    "PRY001",
    "PRY016",
  ]);

  requireOperation("좋아요", like, "post");
  requireErrorCodes("좋아요", like, "post", ["PRY015", "PRY016"]);
  requireOperation("좋아요 취소", like, "delete");
  requireErrorCodes("좋아요 취소", like, "delete", ["PRY015", "PRY016"]);

  requireOperation("내 참여 신청", myApplications, "get");
  requireDataArrayItemProperties(
    "내 참여 신청",
    myApplications,
    "get",
    applicationFields,
  );

  requireRequestFields("참여 신청", applications, "post", ["yoil", "timeSlot"]);
  requireOptionalRequestFields("참여 신청", applications, "post", [
    "applicantName",
    "applicantPhone",
    "applyMemo",
  ]);
  requireRequestMaxLength("참여 신청", applications, "post", "applyMemo", 500);
  requireDataInteger("참여 신청", applications, "post");
  requireErrorCodes("참여 신청", applications, "post", [
    "COMMON001",
    "PRY008",
    "PRY004",
    "PRY005",
    "PRY006",
  ]);

  requireOperation("참여 신청 취소", application, "delete");
  requireErrorCodes("참여 신청 취소", application, "delete", [
    "PRY007",
    "PRY003",
  ]);

  requireOperation("내 기도 이력", history, "get");
  requireDataArrayItemProperties("내 기도 이력", history, "get", historyFields);

  requireOperation("기도제목 카테고리", categories, "get");
  requireDataArrayItemProperties("기도제목 카테고리", categories, "get", [
    "id",
    "categoryCode",
    "categoryName",
    "orderNum",
  ]);

  requireOperation("기도제목 보드", board, "get");
  requireSuccessDataProperties("기도제목 보드", board, "get", [
    "emergency",
    "recentAnswers",
    "ongoing",
  ]);
  for (const property of ["emergency", "recentAnswers", "ongoing"]) {
    requireNestedItemProperties(
      "기도제목 보드",
      board,
      "get",
      property,
      topicFields,
    );
  }

  requireOperation("내 기도제목", myTopics, "get");
  requireDataArrayItemProperties("내 기도제목", myTopics, "get", topicFields);

  requireRequestFields("기도제목 등록", topics, "post", [
    "categoryId",
    "title",
    "content",
  ]);
  requireRequestMaxLength("기도제목 등록", topics, "post", "title", 100);
  requireDataInteger("기도제목 등록", topics, "post");
  requireErrorCodes("기도제목 등록", topics, "post", [
    "COMMON001",
    "PRY004",
    "PRY021",
  ]);

  requireRequestFields("기도제목 수정", topic, "put", [
    "categoryId",
    "title",
    "content",
  ]);
  requireRequestMaxLength("기도제목 수정", topic, "put", "title", 100);
  requireErrorCodes("기도제목 수정", topic, "put", [
    "PRY020",
    "PRY019",
    "PRY002",
    "PRY021",
  ]);

  requireOperation("기도제목 삭제", topic, "delete");
  requireErrorCodes("기도제목 삭제", topic, "delete", ["PRY019", "PRY002"]);

  requireRequestFields("응답완료 요청", answerRequest, "post", [
    "answerContent",
  ]);
  requireErrorCodes("응답완료 요청", answerRequest, "post", [
    "COMMON001",
    "PRY017",
    "PRY019",
    "PRY002",
    "PRY018",
  ]);

  for (const path of [
    myCohorts,
    openCohorts,
    cohort,
    cohortStatus,
    completion,
    like,
    myApplications,
    applications,
    application,
    history,
    categories,
    board,
    myTopics,
    topics,
    topic,
    answerRequest,
  ]) {
    if (path.startsWith("/api/admin")) {
      failures.push(`관리자 경로를 사용자 계약에 넣었습니다: ${path}`);
    }
  }
}
