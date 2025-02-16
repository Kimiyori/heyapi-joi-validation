import { IR } from "@hey-api/openapi-ts";
import { describe, test, expect } from "@jest/globals";

import {
  generateOperationValidators,
  OperationData,
} from "@/compiler/schema/generatePathOrOperation";
import { getResultAsString } from "@/compiler/utils/typeHelpers";

const createBaseOperation = (): IR.OperationObject => ({
  id: "testOperation",
  method: "get",
  path: "/test",
  summary: "Test Operation",
  parameters: undefined,
  responses: {},
});

const createTestOperation = (
  overrides: Partial<OperationData> = {}
): OperationData => ({
  method: "get",
  path: "/test",
  operation: {
    ...createBaseOperation(),
    ...overrides.operation,
  },
  ...overrides,
});

const createParameter = (
  name: string,
  type: "integer" | "string" | "boolean",
  required = false
): IR.ParameterObject => ({
  name,
  required,
  schema: { type },
  location: "path",
  style: "simple",
  explode: false,
});

describe("generateOperationValidators", () => {
  describe("basic functionality", () => {
    test.each([
      ["no parameters", { operation: createBaseOperation() }, 0],
      [
        "empty parameters",
        { operation: { ...createBaseOperation(), parameters: {} } },
        0,
      ],
      [
        "null parameters",
        { operation: { ...createBaseOperation(), parameters: undefined } },
        0,
      ],
    ])("returns empty array for %s", (_, operationOverride, expectedLength) => {
      const data = createTestOperation(operationOverride);
      expect(generateOperationValidators(data)).toHaveLength(expectedLength);
    });
  });

  describe("path parameters", () => {
    test.each([
      ["integer", "integer", "joi.number().integer()"],
      ["string", "string", "joi.string()"],
      ["boolean", "boolean", "joi.boolean()"],
    ])("generates correct validator for %s type", (_, type, expected) => {
      const data = createTestOperation({
        operation: {
          ...createBaseOperation(),
          id: "test",
          parameters: {
            path: {
              testParam: createParameter("testParam", type as "string" | "boolean" | "integer"),
            },
          },
        },
      });

      const result = getResultAsString(generateOperationValidators(data)[0]);
      expect(result).toContain(expected);
    });
  });

  describe("edge cases", () => {
    test("handles multiple parameters of same type", () => {
      const data = createTestOperation({
        operation: {
          ...createBaseOperation(),
          id: "test",
          parameters: {
            path: {
              param1: createParameter("param1", "string"),
              param2: createParameter("param2", "string"),
            },
          },
        },
      });

      const result = getResultAsString(generateOperationValidators(data)[0]);
      expect(result.match(/joi\.string\(\)/g)).toHaveLength(2);
    });

    test("handles mixed required and optional parameters", () => {
      const data = createTestOperation({
        operation: {
          ...createBaseOperation(),
          id: "test",
          parameters: {
            query: {
              required: createParameter("required", "string", true),
              optional: createParameter("optional", "string", false),
            },
          },
        },
      });

      const result = getResultAsString(generateOperationValidators(data)[0]);
      expect(result).toContain(".required()");
      expect(result.match(/\.required\(\)/g)).toHaveLength(1);
    });

    test("generates correct validator names based on operation ID", () => {
      const data = createTestOperation({
        operation: {
          ...createBaseOperation(),
          id: "customTestOperation",
          parameters: {
            path: { param: createParameter("param", "string") },
            query: { param: createParameter("param", "string") },
          },
        },
      });

      const results = generateOperationValidators(data).map(getResultAsString);
      expect(results[0]).toContain("customTestOperationPathValidator");
      expect(results[1]).toContain("customTestOperationQueryValidator");
    });
  });
});
