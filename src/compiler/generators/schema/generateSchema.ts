import { VariableStatement } from 'typescript';

import { createMethodCall } from '@/compiler/ast/factory';
import { createObjectValidator, createVariableStatement } from '@/compiler/ast/statement';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';
import { SchemaObject } from '@/compiler/type';
import { createSchemaName } from '@/compiler/utils/naming';

export const generateJoiValidator = (schema: SchemaObject): VariableStatement => {
  if (!schema) {
    throw new Error('Schema is required');
  }
  const validatorName = createSchemaName(schema.name);
  const validatorExpression = (() => {
    const baseValidator = schema.schema?.properties
      ? createObjectValidator(
          schema.schema.properties,
          schema.schema.required?.slice() ?? undefined
        )
      : generateFieldType(schema.schema);

    return createMethodCall(baseValidator, 'id', [validatorName]);
  })();

  return createVariableStatement(validatorName, validatorExpression);
};
