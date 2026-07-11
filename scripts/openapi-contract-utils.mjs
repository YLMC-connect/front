export const defaultOpenApiUrl =
  process.env.YLMC_OPENAPI_URL ?? "https://ylmc-api.duckdns.org/v3/api-docs";

export async function loadOpenApi(url = defaultOpenApiUrl) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `OpenAPI 문서를 불러오지 못했습니다: HTTP ${response.status}`,
    );
  }

  return response.json();
}

export function createOpenApiContract(spec) {
  const failures = [];
  const operationAt = (path, method) => spec.paths?.[path]?.[method];
  const schemaNamed = (name) => spec.components?.schemas?.[name];

  const schemaFromContent = (content) => {
    if (!content || typeof content !== "object") return undefined;
    return Object.values(content)[0]?.schema;
  };

  const resolveSchema = (schema) => {
    const prefix = "#/components/schemas/";
    if (!schema?.$ref?.startsWith(prefix)) return schema;
    return schemaNamed(schema.$ref.slice(prefix.length));
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

  const requireSuccessDataProperties = (label, path, method, properties) => {
    const operation = requireOperation(label, path, method);
    if (!operation) return;
    const responseSchema = schemaFromContent(
      operation.responses?.["200"]?.content,
    );
    const envelopeSchema = resolveSchema(responseSchema);
    const dataSchema = resolveSchema(envelopeSchema?.properties?.data);

    for (const property of properties) {
      if (!dataSchema?.properties?.[property]) {
        failures.push(
          `${label} 200 응답 data.${property} 필드가 구체적으로 정의되지 않았습니다.`,
        );
      }
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
    const propertySchema = schemaNamed(schemaName)?.properties?.[property];
    if (!propertySchema) return;
    if (
      !Array.isArray(propertySchema.enum) ||
      propertySchema.enum.length === 0
    ) {
      failures.push(`${schemaName}.${property} enum 값이 명시되지 않았습니다.`);
    }
  };

  const requireRequiredProperty = (schemaName, property) => {
    const required = schemaNamed(schemaName)?.required;
    if (!Array.isArray(required) || !required.includes(property)) {
      failures.push(`${schemaName}.${property}가 required가 아닙니다.`);
    }
  };

  const requireMaximum = (schemaName, property, expected) => {
    const maximum = schemaNamed(schemaName)?.properties?.[property]?.maximum;
    if (maximum !== expected) {
      failures.push(
        `${schemaName}.${property} maximum이 ${expected}(으)로 명시되지 않았습니다.`,
      );
    }
  };

  const requireMaxLength = (schemaName, property, expected) => {
    const maxLength =
      schemaNamed(schemaName)?.properties?.[property]?.maxLength;
    if (maxLength !== expected) {
      failures.push(
        `${schemaName}.${property} maxLength가 ${expected}(으)로 명시되지 않았습니다.`,
      );
    }
  };

  const requirePublicOperation = (label, path, method) => {
    const operation = operationAt(path, method);
    if (
      !Array.isArray(operation?.security) ||
      operation.security.length !== 0
    ) {
      failures.push(
        `${label}에 security: []가 없어 전역 JWT 설정을 상속합니다.`,
      );
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

  const hasOperationMatching = (predicate) =>
    Object.entries(spec.paths ?? {}).some(([path, pathItem]) =>
      Object.entries(pathItem).some(([method, operation]) =>
        predicate({ path, method, operation }),
      ),
    );

  const report = (label) => {
    if (failures.length > 0) {
      console.error(`${label} 계약 검증 실패 (${failures.length}건)`);
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(`${label} 계약 검증 통과`);
  };

  return {
    failures,
    operationAt,
    schemaNamed,
    requireOperation,
    requireConcreteRequest,
    requireConcreteSuccess,
    requireSuccessDataProperties,
    requireProperties,
    requireEnum,
    requireRequiredProperty,
    requireMaximum,
    requireMaxLength,
    requirePublicOperation,
    requireResolvableSecurity,
    hasOperationMatching,
    report,
  };
}
