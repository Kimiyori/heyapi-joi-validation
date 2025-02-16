import { IR } from '@hey-api/openapi-ts';
import ts from 'typescript';

import { generateFieldType } from '@/compiler/schema/generateFieldType';
import { generateValidatorName } from '@/compiler/utils/generic';
import { createMethodCall } from '@/compiler/utils/typeHelpers';

export type OperationData = {
  method: keyof IR.PathItemObject;
  operation: IR.OperationObject;
  path: string;
};

const createValidatorPropertyAssignment = (param: IR.ParameterObject): ts.PropertyAssignment => {
  let validator = generateFieldType(param.schema);

  if (param.required) {
    validator = createMethodCall(validator, 'required');
  }

  return ts.factory.createPropertyAssignment(param.name, validator);
};

const createParameterValidator = (
  operationId: string,
  paramType: 'Path' | 'Query',
  params: IR.ParameterObject[]
): ts.VariableStatement => {
  const validatorObject = ts.factory.createObjectLiteralExpression(
    params.map(createValidatorPropertyAssignment),
    true
  );

  const declaration = ts.factory.createVariableDeclaration(
    generateValidatorName(operationId, paramType),
    undefined,
    undefined,
    validatorObject
  );

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const)
  );
};

const generatePathValidator = (data: OperationData): ts.Statement | undefined => {
  const pathParams = Object.values(data.operation.parameters?.path || {});
  return pathParams.length > 0
    ? createParameterValidator(data.operation.id, 'Path', pathParams)
    : undefined;
};

const generateQueryValidator = (data: OperationData): ts.Statement | undefined => {
  const queryParams = Object.values(data.operation.parameters?.query || {});
  return queryParams.length > 0
    ? createParameterValidator(data.operation.id, 'Query', queryParams)
    : undefined;
};

export const generateOperationValidators = (data: OperationData) => {
  const statements: ts.Statement[] = [];

  const pathValidator = generatePathValidator(data);
  if (pathValidator) statements.push(pathValidator);

  const queryValidator = generateQueryValidator(data);
  if (queryValidator) statements.push(queryValidator);

  return statements;
};
