import { IR } from '@hey-api/openapi-ts';
import {
  factory,
  NodeFlags,
  Statement,
  SyntaxKind
} from 'typescript';

import { generateFieldType } from '../schema/generateFieldType';

type OperationData = {
  method: keyof IR.PathItemObject;
  operation: IR.OperationObject;
  path: string;
};

export const generateOperationValidators = (data: OperationData) => {
  const statements: Statement[] = [];

  // Convert parameter objects to arrays and extract values
  const pathParams = Object.values(data.operation.parameters?.path || {});
  const queryParams = Object.values(data.operation.parameters?.query || {});

  if (pathParams.length > 0) {
    const pathValidator = factory.createVariableStatement(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            `${data.operation.id}PathValidator`,
            undefined,
            undefined,
            factory.createObjectLiteralExpression(
              pathParams.map((param) => {
                const validator = param.required
                  ? factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        generateFieldType(param.schema),
                        factory.createIdentifier('required')
                      ),
                      undefined,
                      []
                    )
                  : generateFieldType(param.schema);

                return factory.createPropertyAssignment(param.name, validator);
              }),
              true
            )
          ),
        ],
        NodeFlags.Const
      )
    );
    statements.push(pathValidator);
  }

  if (queryParams.length > 0) {
    const queryValidator = factory.createVariableStatement(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            `${data.operation.id}QueryValidator`,
            undefined,
            undefined,
            factory.createObjectLiteralExpression(
              queryParams.map((param) => {
                const validator = param.required
                  ? factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        generateFieldType(param.schema),
                        factory.createIdentifier('required')
                      ),
                      undefined,
                      []
                    )
                  : generateFieldType(param.schema);

                return factory.createPropertyAssignment(param.name, validator);
              }),
              true
            )
          ),
        ],
        NodeFlags.Const
      )
    );
    statements.push(queryValidator);
  }

  return statements;
};
