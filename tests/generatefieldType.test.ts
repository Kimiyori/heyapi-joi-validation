import { IR } from '@hey-api/openapi-ts';

import { generateFieldType } from '@/compiler/generators/field';

import { getResultAsString } from './testUtils';

describe('generateFieldType', () => {
  test.each([
    ['string', { type: 'string' }, 'joi.string()'],
    ['number', { type: 'number' }, 'joi.number()'],
    ['boolean', { type: 'boolean' }, 'joi.boolean()'],
    ['integer', { type: 'integer' }, 'joi.number().integer()'],
    ['null', { type: 'null' }, 'joi.valid(null)'],
  ])('generates %s validator', (_, schema, expected) => {
    const result = generateFieldType(schema as IR.SchemaObject);
    expect(getResultAsString(result)).toEqual(expected);
  });

  test('generates array validator', () => {
    const schema: IR.SchemaObject = {
      type: 'array',
      items: [{ type: 'string' }],
    };

    const result = generateFieldType(schema);
    const printed = getResultAsString(result);

    expect(printed).toEqual('joi.array().items(joi.string())');
  });

  test('generates enum validator', () => {
    const schema = {
      type: 'enum',
      items: [{ const: 'draft' }, { const: 'published' }, { const: 'archived' }],
    } as IR.SchemaObject;

    const result = generateFieldType(schema);
    const printed = getResultAsString(result);

    expect(printed).toEqual('joi.valid("draft", "published", "archived")');
  });

  test('generates reference validator', () => {
    const schema: IR.SchemaObject = {
      $ref: '#/components/schemas/User',
    };

    const result = generateFieldType(schema);
    expect(getResultAsString(result)).toEqual('UserValidator');
  });

  test('generates alternatives validator', () => {
    const schema: IR.SchemaObject = {
      logicalOperator: 'or',
      items: [{ type: 'string' }, { type: 'number' }],
    };

    const result = generateFieldType(schema);
    const printed = getResultAsString(result);

    expect(printed).toEqual('joi.alternatives().try(joi.string(), joi.number())');
  });
});
