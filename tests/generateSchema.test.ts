import { generateJoiValidator } from '@/compiler/generators/schema/generateSchema';
import { SchemaObject } from '@/compiler/type';

import { getResultAsString } from './testUtils';

type Assertions = {
  [key: string]: string | RegExp;
};

function testSchemaGeneration(schema: SchemaObject, assertions: Assertions) {
  const result = generateJoiValidator(schema);
  const printed = getResultAsString(result);

  for (const key in assertions) {
    const expected = assertions[key];
    if (typeof expected === 'string') {
      expect(printed).toContain(expected);
    } else {
      expect(printed).toMatch(expected);
    }
  }
}

describe('generateJoiValidator', () => {
  test('generates simple object validator', () => {
    const schema: SchemaObject = {
      name: 'User',
      $ref: '#/components/schemas/User',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          age: { type: 'integer' },
        },
        required: ['id'],
      },
    };

    testSchemaGeneration(schema, {
      'export const UserValidator': 'export const UserValidator',
      'id: joi.string().required()': 'id: joi.string().required()',
      'age: joi.number().integer()': 'age: joi.number().integer()',
    });
  });

  test('generates nested object validator', () => {
    const schema: SchemaObject = {
      name: 'Order',
      $ref: '#/components/schemas/Order',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: [{ type: 'string' }],
          },
          customer: { $ref: '#/components/schemas/Customer' },
        },
      },
    };

    testSchemaGeneration(schema, {
      'export const OrderValidator': 'export const OrderValidator',
      'items: joi.array()': 'items: joi.array()',
      'customer: CustomerValidator': 'customer: CustomerValidator',
    });
  });

  test('handles logical operators - or', () => {
    const schema: SchemaObject = {
      name: 'Status',
      $ref: '#/components/schemas/Status',
      schema: {
        logicalOperator: 'or',
        items: [
          { type: 'string', const: 'active' },
          { type: 'string', const: 'inactive' },
        ],
      },
    };

    testSchemaGeneration(schema, {
      'export const StatusValidator': 'export const StatusValidator',
      'joi.alternatives()': 'joi.alternatives()',
      '.try(': '.try(',
    });
  });

  test('handles array with number items', () => {
    const schema: SchemaObject = {
      name: 'NumberArray',
      $ref: '#/components/schemas/NumberArray',
      schema: {
        type: 'array',
        items: [{ type: 'number' }],
      },
    };

    testSchemaGeneration(schema, {
      'export const NumberArrayValidator': 'export const NumberArrayValidator',
      'joi.array().items(joi.number())': 'joi.array().items(joi.number())',
    });
  });

  test('handles enum', () => {
    const schema: SchemaObject = {
      name: 'Color',
      $ref: '#/components/schemas/Color',
      schema: {
        type: 'enum',
        items: [{ const: 'red' }, { const: 'green' }, { const: 'blue' }],
      },
    };

    testSchemaGeneration(schema, {
      'export const ColorValidator': 'export const ColorValidator',
      'joi.valid("red", "green", "blue")': 'joi.valid("red", "green", "blue")',
    });
  });

  test('handles null type', () => {
    const schema: SchemaObject = {
      name: 'NullableString',
      $ref: '#/components/schemas/NullableString',
      schema: {
        type: 'null',
      },
    };

    testSchemaGeneration(schema, {
      'export const NullableStringValidator': 'export const NullableStringValidator',
      'joi.valid(null)': 'joi.valid(null)',
    });
  });
  test('self referencing field', () => {
    const schema: SchemaObject = {
      name: 'Schema',
      $ref: '#/components/schemas/Schema',
      schema: {
        $ref: '#/components/schemas/Schema',
      },
    };

    testSchemaGeneration(schema, {
      'export const SchemaValidator': 'export const SchemaValidator',
      'joi.link("#SchemaValidator").id("SchemaValidator");':
        'joi.link("#SchemaValidator").id("SchemaValidator");',
    });
  });
});
