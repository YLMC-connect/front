import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const contract = createOpenApiContract(await loadOpenApi());
const {
  failures,
  operationAt,
  schemaNamed,
  requireOperation,
  requireConcreteSuccess,
  requireSuccessDataProperties,
} = contract;

const schemaPrefix = "#/components/schemas/";
const posts = "/api/mypage/activities/posts";
const comments = "/api/mypage/activities/comments";
const groups = "/api/mypage/activities/groups";
const lifeStudies = "/api/mypage/activities/life-studies";
const prayers = "/api/mypage/activities/prayers";

function resolveSchema(schema) {
  if (!schema?.$ref?.startsWith(schemaPrefix)) return schema;
  return schemaNamed(schema.$ref.slice(schemaPrefix.length));
}

function responseDataSchema(path, method) {
  const operation = operationAt(path, method);
  const content = operation?.responses?.["200"]?.content;
  const schema = content ? Object.values(content)[0]?.schema : undefined;
  const envelope = resolveSchema(schema);
  return resolveSchema(envelope?.properties?.data);
}

function queryParam(path, method, name) {
  const operation = operationAt(path, method);
  return (operation?.parameters ?? []).find(
    (parameter) => parameter?.in === "query" && parameter?.name === name,
  );
}

function requireQueryParam(label, path, name) {
  const parameter = queryParam(path, "get", name);
  if (!parameter) failures.push(`${label} query ${name}가 없습니다.`);
  return parameter;
}

function requireZeroBasedPage(label, path) {
  const parameter = requireQueryParam(label, path, "page");
  if (!parameter) return;
  const schema = resolveSchema(parameter.schema);
  const description = `${parameter.description ?? ""} ${schema?.description ?? ""}`;
  if (
    /1\s*부터|1-based/i.test(description) &&
    !/0\s*부터|0-based/i.test(description)
  ) {
    failures.push(`${label} 요청 page가 1-based로 적혀 있습니다.`);
  }
  if (parameter.required === true) {
    failures.push(`${label} 요청 page는 필수가 아닙니다.`);
  }
  if (schema?.default === undefined || Number(schema.default) !== 0) {
    failures.push(`${label} 요청 page 기본값 0이 없습니다.`);
  }
}

function requireSizeDefault(label, path) {
  const parameter = requireQueryParam(label, path, "size");
  const schema = resolveSchema(parameter?.schema);
  if (!parameter) return;
  if (schema?.default === undefined || Number(schema.default) !== 10) {
    failures.push(`${label} 요청 size 기본값 10이 없습니다.`);
  }
}

function requireSortDefault(label, path, expected) {
  const parameter = requireQueryParam(label, path, "sort");
  const schema = resolveSchema(parameter?.schema);
  if (!parameter) return;
  if (schema?.default !== expected) {
    failures.push(`${label} 요청 sort 기본값이 ${expected}가 아닙니다.`);
  }
}

function requireOneBasedCurrentPage(label, path) {
  const property = responseDataSchema(path, "get")?.properties?.currentPage;
  const description = property?.description ?? "";
  if (/0\s*부터|0-based|zero-based/i.test(description)) {
    failures.push(`${label} currentPage가 0-based로 적혀 있습니다.`);
  }
  if (!/1\s*부터|1-based|1부터/.test(description)) {
    failures.push(`${label} currentPage가 1-based로 명시되지 않았습니다.`);
  }
}

function requirePageContent(label, path, fields) {
  requireOperation(label, path, "get");
  requireConcreteSuccess(label, path, "get");
  requireSuccessDataProperties(label, path, "get", [
    "content",
    "totalElements",
    "totalPages",
    "currentPage",
    "size",
    "hasNext",
  ]);
  const content = resolveSchema(
    responseDataSchema(path, "get")?.properties?.content,
  );
  const item = resolveSchema(content?.items);
  for (const field of fields) {
    if (!item?.properties?.[field]) {
      failures.push(`${label} content[].${field} 필드가 없습니다.`);
    }
  }
  requireZeroBasedPage(label, path);
  requireSizeDefault(label, path);
  requireOneBasedCurrentPage(label, path);
}

function requireEnumValues(label, path, property, expected) {
  const content = resolveSchema(
    responseDataSchema(path, "get")?.properties?.content,
  );
  const item = resolveSchema(content?.items);
  const schema = resolveSchema(item?.properties?.[property]);
  const values = schema?.enum;
  if (!Array.isArray(values)) {
    failures.push(`${label} ${property} enum이 없습니다.`);
    return;
  }
  for (const value of expected) {
    if (!values.includes(value)) {
      failures.push(`${label} ${property} enum에 ${value}가 없습니다.`);
    }
  }
}

function requireUnpaged(label, path, fields) {
  requireOperation(label, path, "get");
  requireConcreteSuccess(label, path, "get");
  requireSuccessDataProperties(label, path, "get", fields);
  for (const name of ["page", "size", "sort"]) {
    if (queryParam(path, "get", name)) {
      failures.push(`${label} query ${name}가 있으면 안 됩니다.`);
    }
  }
  const data = responseDataSchema(path, "get");
  if (!data || data.type === "array" || data.properties?.content) {
    failures.push(`${label} 200 응답 data가 페이징 없는 객체가 아닙니다.`);
  }
}

function requireNestedProperties(label, path, property, fields) {
  const data = responseDataSchema(path, "get");
  const arraySchema = resolveSchema(data?.properties?.[property]);
  const item = resolveSchema(arraySchema?.items);
  for (const field of fields) {
    if (!item?.properties?.[field]) {
      failures.push(`${label} ${property}[].${field} 필드가 없습니다.`);
    }
  }
}

requirePageContent("내 나눔글", posts, [
  "id",
  "title",
  "content",
  "status",
  "statusName",
  "categoryCode",
  "itemStatus",
  "viewCount",
  "thumbnailUrl",
  "createdAt",
]);
requireSortDefault("내 나눔글", posts, "id,desc");
requireEnumValues("내 나눔글", posts, "status", [
  "AVAILABLE",
  "RESERVED",
  "COMPLETED",
]);
requireEnumValues("내 나눔글", posts, "statusName", [
  "나눔중",
  "예약완료",
  "나눔완료",
]);

requirePageContent("내 댓글", comments, [
  "id",
  "shareId",
  "shareTitle",
  "content",
  "createdAt",
]);
requireSortDefault("내 댓글", comments, "id,desc");

requirePageContent("내 소모임", groups, [
  "id",
  "title",
  "type",
  "categoryCode",
  "maxParticipants",
  "currentParticipants",
  "status",
  "leaderId",
  "leaderName",
  "joinedAt",
]);
requireSortDefault("내 소모임", groups, "joinedAt,desc");
const groupType = requireQueryParam("내 소모임", groups, "type");
if (groupType?.required === true) {
  failures.push("내 소모임 query type은 필수가 아닙니다.");
}
const groupTypeValues = resolveSchema(groupType?.schema)?.enum;
if (
  !Array.isArray(groupTypeValues) ||
  !groupTypeValues.includes("GROUP") ||
  !groupTypeValues.includes("VOLUNTEER")
) {
  failures.push("내 소모임 query type enum에 GROUP과 VOLUNTEER가 없습니다.");
}

requireUnpaged("내 삶공부", lifeStudies, [
  "completionCount",
  "applications",
  "ongoing",
  "completed",
]);
requireNestedProperties("내 삶공부", lifeStudies, "applications", [
  "cohortId",
  "lifeStudyId",
  "name",
  "cohortNumber",
  "startDate",
  "status",
  "description",
  "appliedAt",
]);
requireNestedProperties("내 삶공부", lifeStudies, "ongoing", [
  "cohortId",
  "lifeStudyId",
  "name",
  "cohortNumber",
  "period",
  "progress",
  "week",
  "status",
  "nextClass",
  "attendCount",
  "totalClassCount",
]);
requireNestedProperties("내 삶공부", lifeStudies, "completed", [
  "lifeStudyId",
  "name",
  "cohortId",
  "cohortNumber",
  "status",
  "completedAt",
  "attendCount",
  "totalClassCount",
]);

requireUnpaged("내 기도 활동", prayers, [
  "activeCount",
  "totalPeriod",
  "totalPeriodDays",
  "totalRoomCount",
  "currentActivities",
  "pastActivities",
]);
for (const property of ["currentActivities", "pastActivities"]) {
  requireNestedProperties("내 기도 활동", prayers, property, [
    "cohortId",
    "cohortName",
    "cohortYear",
    "yoil",
    "yoilName",
    "timeSlot",
    "timeSlotName",
    "memberRole",
    "memberRoleName",
    "joinedAt",
    "leftAt",
    "period",
    "leaveReason",
    "active",
  ]);
}

for (const path of [posts, comments, groups, lifeStudies, prayers]) {
  if (path.startsWith("/api/admin")) {
    failures.push(`관리자 경로를 사용자 계약에 넣었습니다: ${path}`);
  }
}

contract.report("마이페이지 활동 API");
