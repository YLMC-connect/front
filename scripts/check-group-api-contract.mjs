import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const contract = createOpenApiContract(await loadOpenApi());
const {
  failures,
  requireConcreteRequest,
  requireConcreteSuccess,
  requireProperties,
  requireEnum,
  requireMaximum,
  requireMinimum,
  requireMaxLength,
  requireRequiredProperty,
  hasOperationMatching,
  requireDocumentedErrorCodes,
} = contract;

requireConcreteSuccess("동행 목록", "/api/communion", "get");
requireConcreteSuccess("내 동행 목록", "/api/communion/my", "get");
requireConcreteSuccess("동행 상세", "/api/communion/{id}", "get");
requireConcreteRequest("동행 생성", "/api/communion", "post");
requireConcreteSuccess("동행 생성", "/api/communion", "post");
requireConcreteRequest("동행 수정", "/api/communion/{id}", "put");
requireConcreteSuccess("동행 수정", "/api/communion/{id}", "put");
requireConcreteSuccess("동행 삭제", "/api/communion/{id}", "delete");
requireConcreteRequest("동행 상태 변경", "/api/communion/{id}/status", "put");
requireConcreteSuccess("동행 상태 변경", "/api/communion/{id}/status", "put");
requireConcreteSuccess("동행 참여", "/api/communion/{id}/join", "post");
requireConcreteSuccess("동행 탈퇴", "/api/communion/{id}/leave", "delete");
requireConcreteSuccess("멤버 목록", "/api/communion/{id}/members", "get");
requireConcreteSuccess(
  "멤버 강퇴",
  "/api/communion/{id}/kick/{targetUserId}",
  "delete",
);
requireConcreteSuccess("공지 목록", "/api/communion/{id}/notices", "get");
requireConcreteRequest("공지 생성", "/api/communion/{id}/notices", "post");
requireConcreteSuccess("공지 생성", "/api/communion/{id}/notices", "post");
requireConcreteRequest(
  "공지 수정",
  "/api/communion/{id}/notices/{noticeId}",
  "put",
);
requireConcreteSuccess(
  "공지 수정",
  "/api/communion/{id}/notices/{noticeId}",
  "put",
);
requireConcreteSuccess(
  "공지 삭제",
  "/api/communion/{id}/notices/{noticeId}",
  "delete",
);

requireProperties("CommunionDto", [
  "id",
  "type",
  "title",
  "content",
  "schedule",
  "location",
  "categoryCode",
  "maxParticipants",
  "currentParticipants",
  "status",
  "leaderName",
  "createdAt",
]);
requireProperties("CommunionListRequestDto", [
  "type",
  "categoryCode",
  "status",
  "keyword",
  "lastId",
  "size",
]);
requireProperties("CommunionDetailDto", [
  "id",
  "type",
  "title",
  "content",
  "schedule",
  "location",
  "categoryCode",
  "maxParticipants",
  "currentParticipants",
  "status",
  "leaderId",
  "leaderName",
  "createdAt",
]);
requireProperties("CommunionMemberDto", ["userId", "userName", "joinedAt"]);
requireProperties("NoticeDto", [
  "id",
  "title",
  "content",
  "createdAt",
  "updatedAt",
]);

for (const schemaName of ["CommunionDto", "CommunionDetailDto"]) {
  for (const property of ["type", "categoryCode", "status"]) {
    requireEnum(schemaName, property);
  }
}
for (const property of ["type", "categoryCode", "status"]) {
  requireEnum("CommunionListRequestDto", property);
}
requireEnum("CommunionCreateRequestDto", "categoryCode");
requireEnum("CommunionUpdateRequestDto", "categoryCode");
requireEnum("CommunionStatusUpdateRequestDto", "status");

const createFields = [
  "type",
  "title",
  "content",
  "categoryCode",
  "maxParticipants",
  "schedule",
  "location",
];
const updateFields = createFields.filter((field) => field !== "type");
for (const [schemaName, fields] of [
  ["CommunionCreateRequestDto", createFields],
  ["CommunionUpdateRequestDto", updateFields],
]) {
  requireProperties(schemaName, fields);
  for (const property of fields) {
    requireRequiredProperty(schemaName, property);
  }
}

for (const schemaName of [
  "CommunionCreateRequestDto",
  "CommunionUpdateRequestDto",
]) {
  requireMaxLength(schemaName, "title", 20);
  requireMaxLength(schemaName, "content", 200);
  requireMaximum(schemaName, "maxParticipants", 100);
  requireMinimum(schemaName, "maxParticipants", 2);
}
requireMaxLength("NoticeRequestDto", "title", 30);
requireMaxLength("NoticeRequestDto", "content", 500);

const hasLeaderTransfer = hasOperationMatching(({ operation }) => {
  const summary = operation?.summary ?? "";
  const operationId = operation?.operationId ?? "";
  const isCommunion = (operation?.tags ?? []).includes("Communion");
  return (
    isCommunion &&
    (summary.includes("이관") ||
      /transfer.*leader|leader.*transfer/i.test(operationId))
  );
});
if (!hasLeaderTransfer) {
  failures.push("소모임장 이관 endpoint가 없습니다.");
}

for (const [label, path, method] of [
  ["동행 상세", "/api/communion/{id}", "get"],
  ["동행 생성", "/api/communion", "post"],
  ["동행 수정", "/api/communion/{id}", "put"],
  ["동행 삭제", "/api/communion/{id}", "delete"],
  ["동행 상태 변경", "/api/communion/{id}/status", "put"],
  ["동행 참여", "/api/communion/{id}/join", "post"],
  ["동행 탈퇴", "/api/communion/{id}/leave", "delete"],
  ["멤버 강퇴", "/api/communion/{id}/kick/{targetUserId}", "delete"],
  ["공지 생성", "/api/communion/{id}/notices", "post"],
  ["공지 수정", "/api/communion/{id}/notices/{noticeId}", "put"],
  ["공지 삭제", "/api/communion/{id}/notices/{noticeId}", "delete"],
]) {
  requireDocumentedErrorCodes(label, path, method);
}

contract.report("동행 API");
