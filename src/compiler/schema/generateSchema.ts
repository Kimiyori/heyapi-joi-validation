import { IR } from '@hey-api/openapi-ts';
import {
  Expression,
  factory,
  NodeFlags,
  PropertyAssignment,
  SyntaxKind,
  VariableStatement,
} from 'typescript';

import { generateFieldType } from '@/compiler/schema/generateFieldType';
import { SchemaObject } from '@/compiler/type';
import { createSchemaName } from '@/compiler/utils/generic';
import { createIdentifier, createMethodCall } from '@/compiler/utils/typeHelpers';

const createObjectValidator = (
  properties: Record<string, IR.SchemaObject>,
  required?: string[]
): Expression => {
  const propertyAssignments = Object.entries(properties).map(([propName, propSchema]) =>
    createPropertyAssignment(propName, propSchema, required?.includes(propName))
  );

  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      createIdentifier('joi'),
      factory.createIdentifier('object')
    ),
    undefined,
    [factory.createObjectLiteralExpression(propertyAssignments, true)]
  );
};

const createPropertyAssignment = (
  propName: string,
  propSchema: IR.SchemaObject,
  isRequired: boolean = false
): PropertyAssignment => {
  let joiValidatorExpr = generateFieldType(propSchema);

  if (isRequired) {
    joiValidatorExpr = createMethodCall(joiValidatorExpr, 'required');
  }

  return factory.createPropertyAssignment(createIdentifier(propName), joiValidatorExpr);
};

const createVariableStatement = (
  validatorName: string,
  expression: Expression
): VariableStatement => {
  const validatorIdentifier = createIdentifier(validatorName);
  const declaration = factory.createVariableDeclaration(
    validatorIdentifier,
    undefined,
    undefined,
    expression
  );

  const declarationList = factory.createVariableDeclarationList([declaration], NodeFlags.Const);

  const exportModifier = factory.createModifier(SyntaxKind.ExportKeyword);
  return factory.createVariableStatement([exportModifier], declarationList);
};

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
