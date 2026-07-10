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

const requireConcreteRequest = (label, path, method) => {
  const operation = operationAt(path, method);
  const schema = schemaFromContent(operation?.requestBody?.content);
  if (!isConcreteSchema(schema)) {
    failures.push(`${label} 요청 스키마가 구체 DTO가 아닙니다.`);
  }
};

const requireConcreteSuccess = (label, path, method) => {
  const operation = operationAt(path, method);
  const schema = schemaFromContent(operation?.responses?.["200"]?.content);
  if (!isConcreteSchema(schema)) {
    failures.push(`${label} 200 응답 스키마가 구체 DTO가 아닙니다.`);
  }
};

const requirePublicOperation = (label, path, method) => {
  const operation = operationAt(path, method);
  if (!Array.isArray(operation?.security) || operation.security.length !== 0) {
    failures.push(`${label}에 security: []가 없어 전역 JWT 설정을 상속합니다.`);
  }
};

const requireResolvableSecurity = (label, path, method) => {
  const operation = operationAt(path, method);
  const schemes = spec.components?.securitySchemes ?? {};
  for (const requirement of operation?.security ?? spec.security ?? []) {
    for (const name of Object.keys(requirement)) {
      if (!schemes[name]) {
        failures.push(
          `${label}: 정의되지 않은 security scheme '${name}'을 참조합니다.`,
        );
      }
    }
  }
};

requireConcreteRequest("로그인", "/api/auth/login", "post");
requireConcreteSuccess("로그인", "/api/auth/login", "post");
requirePublicOperation("로그인", "/api/auth/login", "post");

requireConcreteRequest("토큰 재발급", "/api/auth/refresh", "post");
requireConcreteSuccess("토큰 재발급", "/api/auth/refresh", "post");
requirePublicOperation("토큰 재발급", "/api/auth/refresh", "post");

requireConcreteRequest("회원가입", "/api/signup", "post");
requireConcreteSuccess("회원가입", "/api/signup", "post");
requirePublicOperation("회원가입", "/api/signup", "post");

requireConcreteSuccess("내 정보 조회", "/api/member/me", "get");
requireResolvableSecurity("내 정보 조회", "/api/member/me", "get");

if (failures.length > 0) {
  console.error(`인증 API 계약 검증 실패 (${failures.length}건)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("인증 API 계약 검증 통과");
}
