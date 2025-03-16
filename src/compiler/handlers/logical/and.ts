import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { generateFieldType } from '@/compiler/generators/field';

import { SchemaHandler } from '../base';

export class LogicalAndSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return !schema.type && schema.logicalOperator === 'and' && Array.isArray(schema.items ?? []);
  }

  public execute(schema: IR.SchemaObject): Expression {
    const [valueSchema, fieldSchema] = schema.items as IR.SchemaObject[];

    const schemaObject: IR.SchemaObject = {
      type: fieldSchema.type,
      pattern: '/./',
      properties: {
        value: valueSchema,
      },
    };
    return generateFieldType(schemaObject);
  }
}
