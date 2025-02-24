import { IR } from '@hey-api/openapi-ts';

export * from './complex/alternatives';
export * from './primitives/string';
export * from './complex/array';
export * from './primitives/boolean';
export * from './complex/enum';
export * from './primitives/number';
export * from './complex/object';
export * from './complex/tuple';
export * from './complex/loginalAnd';

export const isLogicalOr = (schema: IR.SchemaObject) => {
  return !schema.type && schema.logicalOperator === 'or' && Array.isArray(schema.items ?? []);
};

export const isLogicalAnd = (schema: IR.SchemaObject) => {
  return !schema.type && schema.logicalOperator === 'and' && Array.isArray(schema.items ?? []);
};
