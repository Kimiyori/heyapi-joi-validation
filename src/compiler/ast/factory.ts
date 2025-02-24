import {
  CallExpression,
  Expression,
  factory,
  isCallExpression,
  isIdentifier,
  Node,
} from 'typescript';

export const createIdentifier = (name: string) => factory.createIdentifier(name);
export const createLiteral = (value: unknown): Expression => {
  if (value === undefined) {
    return createIdentifier(String(value));
  }
  if (typeof value === 'string') {
    return factory.createStringLiteral(value);
  }
  if (typeof value === 'number') {
    return factory.createNumericLiteral(value);
  }
  if (typeof value === 'boolean') {
    return value ? factory.createTrue() : factory.createFalse();
  }
  if (value === null) {
    return factory.createNull();
  }
  if (value instanceof RegExp) {
    return factory.createNewExpression(
      factory.createIdentifier('RegExp'),
      undefined,
      value.flags
        ? [factory.createStringLiteral(value.source), factory.createStringLiteral(value.flags)]
        : [factory.createStringLiteral(value.source)]
    );
  }
  return factory.createNull();
};

export const createMethodCall = (
  target: Expression,
  method: string,
  args?: unknown[]
): CallExpression => {
  const argumentExpressions = args?.map(mapArgumentToExpression) || [];

  return factory.createCallExpression(
    factory.createPropertyAccessExpression(target, createIdentifier(method)),
    undefined,
    argumentExpressions
  );
};

const mapArgumentToExpression = (arg: unknown): Expression => {
  if (arg === null || arg === undefined) {
    return createIdentifier(String(arg));
  }
  if (typeof arg === 'object' && arg !== null && 'value' in arg) {
    const value = (arg as { value: Expression }).value;
    if (isCallExpression(value)) {
      return factory.createPropertyAssignment('value', value).initializer;
    }
  }
  if (isCallExpression(arg as Node) || isIdentifier(arg as Node)) {
    return arg as Expression;
  }

  if (Array.isArray(arg)) {
    return factory.createArrayLiteralExpression(
      arg.map((item: unknown) =>
        isIdentifier(item as Node) ? (item as Expression) : createLiteral(item)
      )
    );
  }
  return createLiteral(arg);
};

export const chainMethods = (
  base: string,
  ...methodData: Array<[string, unknown[]] | string>
): CallExpression => {
  let callExpression: Expression = createIdentifier(base);
  methodData.forEach((item) => {
    if (typeof item === 'string') {
      callExpression = createMethodCall(callExpression, item, []);
    } else {
      const [method, args] = item;
      callExpression = createMethodCall(callExpression, method, args);
    }
  });

  return callExpression as CallExpression;
};
