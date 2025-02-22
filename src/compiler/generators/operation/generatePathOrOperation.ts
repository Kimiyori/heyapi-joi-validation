import { IR } from '@hey-api/openapi-ts';
import {
  factory,
  NodeFlags,
  PropertyAssignment,
  Statement,
  SyntaxKind,
  VariableStatement,
} from 'typescript';

import { createMethodCall } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';
import { generateValidatorName } from '@/compiler/utils/naming';

export type OperationData = {
  method: keyof IR.PathItemObject;
  operation: IR.OperationObject;
  path: string;
};

const createValidatorPropertyAssignment = (param: IR.ParameterObject): PropertyAssignment => {
  let validator = generateFieldType(param.schema);

  if (param.required) {
    validator = createMethodCall(validator, 'required');
  }

  return factory.createPropertyAssignment(param.name, validator);
};

const createParameterValidator = (
  operationId: string,
  paramType: 'Path' | 'Query',
  params: IR.ParameterObject[]
): VariableStatement => {
  const validatorObject = factory.createObjectLiteralExpression(
    params.map(createValidatorPropertyAssignment),
    true
  );

  const declaration = factory.createVariableDeclaration(
    generateValidatorName(operationId, paramType),
    undefined,
    undefined,
    validatorObject
  );

  return factory.createVariableStatement(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList([declaration], NodeFlags.Const)
  );
};

const generatePathValidator = (data: OperationData): Statement | undefined => {
  const pathParams = Object.values(data.operation.parameters?.path || {});
  return pathParams.length > 0
    ? createParameterValidator(data.operation.id, 'Path', pathParams)
    : undefined;
};

const generateQueryValidator = (data: OperationData): Statement | undefined => {
  const queryParams = Object.values(data.operation.parameters?.query || {});
  return queryParams.length > 0
    ? createParameterValidator(data.operation.id, 'Query', queryParams)
    : undefined;
};

export const generateOperationValidators = (data: OperationData) => {
  const statements: Statement[] = [];

  const pathValidator = generatePathValidator(data);
  if (pathValidator) statements.push(pathValidator);

  const queryValidator = generateQueryValidator(data);
  if (queryValidator) statements.push(queryValidator);

  return statements;
};
