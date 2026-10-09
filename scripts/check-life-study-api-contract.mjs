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
  requireConcreteRequest,
  requireSuccessDataProperties,
  requireDocumentedErrorCodes,
} = contract;

const schemaPrefix = "#/components/schemas/";

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

function requestSchema(path, method) {
  const operation = operationAt(path, method);
  const content = operation?.requestBody?.content;
  const schema = content ? Object.values(content)[0]?.schema : undefined;
  return resolveSchema(schema);
}

function responseErrorText(path, method) {
  const operation = operationAt(path, method);
  return Object.entries(operation?.responses ?? {})
    .filter(([status]) => /^[45]\d\d$/.test(status))
    .map(([, response]) => response?.description ?? "")
    .join(" ");
}

function requireRequestFields(label, path, method, fields) {
  requireConcreteRequest(label, path, method);
  const schema = requestSchema(path, method);
  for (const field of fields) {
    if (!schema?.properties?.[field]) {
      failures.push(`${label} 요청 ${field} 필드가 없습니다.`);
    }
    if (!Array.isArray(schema?.required) || !schema.required.includes(field)) {
      failures.push(`${label} 요청 ${field}가 required가 아닙니다.`);
    }
  }
}

function requireDataArrayItemProperties(label, path, method, fields) {
  const data = responseDataSchema(path, method);
  if (data?.type !== "array") {
    failures.push(`${label} 200 응답 data가 배열이 아닙니다.`);
    return;
  }
  const itemSchema = resolveSchema(data.items);
  for (const field of fields) {
    if (!itemSchema?.properties?.[field]) {
      failures.push(`${label} 200 응답 data[].${field} 필드가 없습니다.`);
    }
  }
}

function requireNestedItemProperties(label, path, method, property, fields) {
  const data = responseDataSchema(path, method);
  const arraySchema = resolveSchema(data?.properties?.[property]);
  const itemSchema = resolveSchema(arraySchema?.items);
  for (const field of fields) {
    if (!itemSchema?.properties?.[field]) {
      failures.push(
        `${label} 200 응답 data.${property}[].${field} 필드가 없습니다.`,
      );
    }
  }
}

function requireErrorCodes(label, path, method, codes) {
  requireDocumentedErrorCodes(label, path, method);
  const descriptions = responseErrorText(path, method);
  for (const code of codes) {
    if (!descriptions.includes(code)) {
      failures.push(
        `${label} 오류 코드 ${code}가 응답 description에 없습니다.`,
      );
    }
  }
}

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

requireRequestFields("출석 일괄 저장", attendance, "put", ["attendedUserIds"]);
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
requireErrorCodes("수료 현황", cohortCompletions, "get", ["LST017", "LST001"]);

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

contract.report("삶공부 수업·출석·수료 API");
