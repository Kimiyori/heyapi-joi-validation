import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { generateFieldType } from '@/compiler/generators/field/generateFieldType';

export const handleLogicalCombination = (schema: IR.SchemaObject): Expression => {
  const [valueSchema, fieldSchema] = schema.items as IR.SchemaObject[];

  const schemaObject: IR.SchemaObject = {
    type: fieldSchema.type,
    pattern: '/./',
    properties: {
      value: valueSchema,
    },
  };
  return generateFieldType(schemaObject);
};
