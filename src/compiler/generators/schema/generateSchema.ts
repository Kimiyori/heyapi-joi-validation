import { VariableStatement } from 'typescript';

import { createMethodCall } from '@/compiler/ast/factory';
import { createObjectValidator, createVariableStatement } from '@/compiler/ast/statement';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';
import { SchemaObject } from '@/compiler/type';
import { createSchemaName } from '@/compiler/utils/naming';
import { schemaContext } from '@/compiler/utils/schemaNameContext';

export const generateJoiValidator = (schema: SchemaObject): VariableStatement => {
  if (!schema) {
    throw new Error('Schema is required');
  }
  schemaContext.beginSchema(schema.name);
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

  const response = createVariableStatement(validatorName, validatorExpression);
  schemaContext.endSchema();
  return response;
};
