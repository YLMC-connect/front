import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const contract = createOpenApiContract(await loadOpenApi());
const {
  requireOperation,
  requireConcreteRequest,
  requireConcreteSuccess,
  requireProperties,
  requireEnum,
  requireRequiredProperty,
  findOperationMatching,
  failures,
} = contract;

requireConcreteSuccess("나눔 목록", "/api/share", "get");
requireConcreteSuccess("나눔 상세", "/api/share/{id}", "get");
requireConcreteRequest("나눔 등록", "/api/share", "post");
requireConcreteSuccess("나눔 등록", "/api/share", "post");
requireConcreteRequest("나눔 수정", "/api/share/{id}", "put");
requireConcreteSuccess("나눔 수정", "/api/share/{id}", "put");
requireConcreteSuccess("나눔 삭제", "/api/share/{id}", "delete");
requireConcreteSuccess("댓글 목록", "/api/share/{id}/comments", "get");
requireConcreteRequest("댓글 등록", "/api/share/{id}/comments", "post");
requireConcreteSuccess("댓글 등록", "/api/share/{id}/comments", "post");
requireConcreteRequest("댓글 수정", "/api/share/comments/{commentId}", "put");
requireConcreteSuccess("댓글 수정", "/api/share/comments/{commentId}", "put");
requireConcreteSuccess(
  "댓글 삭제",
  "/api/share/comments/{commentId}",
  "delete",
);
requireConcreteRequest("콘텐츠 신고", "/api/reports", "post");
requireConcreteSuccess("콘텐츠 신고", "/api/reports", "post");

requireProperties("ShareDto", [
  "id",
  "title",
  "status",
  "categoryCode",
  "itemStatus",
  "authorId",
  "authorName",
  "createdAt",
  "images",
]);
requireProperties("ShareListRequestDto", [
  "status",
  "categoryCode",
  "keyword",
  "lastId",
  "size",
]);
requireProperties("ShareDetailDto", [
  "id",
  "title",
  "content",
  "status",
  "categoryCode",
  "itemStatus",
  "authorId",
  "authorName",
  "createdAt",
  "images",
]);
requireProperties("ShareCommentResponseDto", [
  "id",
  "content",
  "authorId",
  "authorName",
  "createdAt",
]);

for (const schemaName of ["ShareDto", "ShareDetailDto"]) {
  for (const property of ["status", "categoryCode", "itemStatus"]) {
    requireEnum(schemaName, property);
  }
}
requireEnum("ShareListRequestDto", "status");
requireEnum("ShareListRequestDto", "categoryCode");
requireRequiredProperty("ShareCreateRequestDto", "images");
requireOperation("나눔 상태 변경", "/api/share/{id}/status", "put");

const imageUpload = findOperationMatching(({ method, operation }) => {
  const summary = operation?.summary ?? "";
  const operationId = operation?.operationId ?? "";
  return (
    method === "post" &&
    ((summary.includes("업로드") &&
      (summary.includes("이미지") || summary.includes("파일"))) ||
      /upload.*(image|file)|(image|file).*upload/i.test(operationId))
  );
});
if (!imageUpload) {
  failures.push("이미지 업로드 endpoint가 없습니다.");
} else {
  requireConcreteRequest("이미지 업로드", imageUpload.path, imageUpload.method);
  requireConcreteSuccess("이미지 업로드", imageUpload.path, imageUpload.method);
}

contract.report("나눔 API");
