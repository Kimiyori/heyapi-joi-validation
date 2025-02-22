import { IR } from '@hey-api/openapi-ts';
import {
  Expression,
  factory,
  NodeFlags,
  PropertyAssignment,
  SyntaxKind,
  VariableStatement,
} from 'typescript';

import { generateFieldType } from '../generators/field/generateFieldType';

import { createIdentifier, createMethodCall } from './factory';

export const createObjectValidator = (
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

export const createPropertyAssignment = (
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

export const createVariableStatement = (
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
