const openApiUrl =
  process.env.YLMC_OPENAPI_URL ?? "https://ylmc-api.duckdns.org/v3/api-docs";

const response = await fetch(openApiUrl);
if (!response.ok) {
  throw new Error(
    `OpenAPI 문서를 불러오지 못했습니다: HTTP ${response.status}`,
  );
}

const spec = await response.json();
const failures = [];

const operationAt = (path, method) => spec.paths?.[path]?.[method];
const schemaNamed = (name) => spec.components?.schemas?.[name];

const schemaFromContent = (content) => {
  if (!content || typeof content !== "object") return undefined;
  return Object.values(content)[0]?.schema;
};

const isConcreteSchema = (schema) =>
  Boolean(
    schema?.$ref ||
    (schema?.type === "object" &&
      schema.properties &&
      Object.keys(schema.properties).length > 0),
  );

const requireOperation = (label, path, method) => {
  const operation = operationAt(path, method);
  if (!operation) {
    failures.push(
      `${label} endpoint가 없습니다: ${method.toUpperCase()} ${path}`,
    );
  }
  return operation;
};

const requireConcreteRequest = (label, path, method) => {
  const operation = requireOperation(label, path, method);
  if (!operation) return;
  const schema = schemaFromContent(operation.requestBody?.content);
  if (!isConcreteSchema(schema)) {
    failures.push(`${label} 요청 스키마가 구체 DTO가 아닙니다.`);
  }
};

const requireConcreteSuccess = (label, path, method) => {
  const operation = requireOperation(label, path, method);
  if (!operation) return;
  const schema = schemaFromContent(operation.responses?.["200"]?.content);
  if (!isConcreteSchema(schema)) {
    failures.push(`${label} 200 응답 스키마가 구체 DTO가 아닙니다.`);
  }
};

const requireProperties = (schemaName, properties) => {
  const schema = schemaNamed(schemaName);
  for (const property of properties) {
    if (!schema?.properties?.[property]) {
      failures.push(`${schemaName}.${property} 필드가 없습니다.`);
    }
  }
};

const requireEnum = (schemaName, property) => {
  const values = schemaNamed(schemaName)?.properties?.[property]?.enum;
  if (!Array.isArray(values) || values.length === 0) {
    failures.push(`${schemaName}.${property} enum 값이 명시되지 않았습니다.`);
  }
};

const requireRequiredProperty = (schemaName, property) => {
  const required = schemaNamed(schemaName)?.required;
  if (!Array.isArray(required) || !required.includes(property)) {
    failures.push(`${schemaName}.${property}가 required가 아닙니다.`);
  }
};

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

if (failures.length > 0) {
  console.error(`나눔 API 계약 검증 실패 (${failures.length}건)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("나눔 API 계약 검증 통과");
}
