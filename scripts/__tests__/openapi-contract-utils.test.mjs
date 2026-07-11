import assert from "node:assert/strict";
import test from "node:test";
import { createOpenApiContract } from "../openapi-contract-utils.mjs";

function createSpec() {
  return {
    security: [{ Bearer: [] }],
    paths: {
      "/items": {
        get: {
          tags: ["Items"],
          summary: "항목 목록",
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ItemResponse" },
                },
              },
            },
          },
        },
        post: {
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemRequest" },
              },
            },
          },
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ItemResponse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: { Bearer: { type: "http", scheme: "bearer" } },
      schemas: {
        ItemRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", maxLength: 20 },
            status: { type: "string", enum: ["OPEN", "DONE"] },
            size: { type: "integer", maximum: 100 },
          },
        },
        ItemResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: { available: { type: "boolean" } },
            },
          },
        },
      },
    },
  };
}

test("accepts concrete operations and declared schema constraints", () => {
  const contract = createOpenApiContract(createSpec());

  contract.requireConcreteSuccess("목록", "/items", "get");
  contract.requireSuccessDataProperties("목록", "/items", "get", ["available"]);
  contract.requireConcreteRequest("생성", "/items", "post");
  contract.requirePublicOperation("생성", "/items", "post");
  contract.requireResolvableSecurity("목록", "/items", "get");
  contract.requireProperties("ItemRequest", ["name", "status", "size"]);
  contract.requireEnum("ItemRequest", "status");
  contract.requireRequiredProperty("ItemRequest", "name");
  contract.requireMaxLength("ItemRequest", "name", 20);
  contract.requireMaximum("ItemRequest", "size", 100);

  assert.deepEqual(contract.failures, []);
});

test("collects missing operations, fields, enums, and constraints", () => {
  const contract = createOpenApiContract(createSpec());

  contract.requireOperation("상세", "/items/{id}", "get");
  contract.requireProperties("ItemRequest", ["missing"]);
  contract.requireEnum("ItemRequest", "name");
  contract.requireRequiredProperty("ItemRequest", "status");
  contract.requireMaxLength("ItemRequest", "name", 30);
  contract.requireMaximum("ItemRequest", "size", 10);
  contract.requireSuccessDataProperties("목록", "/items", "get", ["missing"]);

  assert.equal(contract.failures.length, 7);
  assert.match(contract.failures[0], /endpoint가 없습니다/);
  assert.match(contract.failures[1], /필드가 없습니다/);
  assert.match(contract.failures[2], /enum 값/);
});

test("reports inherited security and unresolved scheme references", () => {
  const spec = createSpec();
  spec.security = [{ MissingBearer: [] }];
  const contract = createOpenApiContract(spec);

  contract.requirePublicOperation("목록", "/items", "get");
  contract.requireResolvableSecurity("목록", "/items", "get");

  assert.equal(contract.failures.length, 2);
  assert.match(contract.failures[0], /security: \[\]/);
  assert.match(contract.failures[1], /MissingBearer/);
});

test("finds a domain operation by metadata without assuming its path", () => {
  const contract = createOpenApiContract(createSpec());

  assert.equal(
    contract.hasOperationMatching(
      ({ operation }) => operation?.summary === "항목 목록",
    ),
    true,
  );
  assert.equal(
    contract.hasOperationMatching(
      ({ operation }) => operation?.summary === "소모임장 이관",
    ),
    false,
  );
});
