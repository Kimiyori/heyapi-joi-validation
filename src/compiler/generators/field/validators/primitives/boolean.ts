import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';



type BooleanValidation = string | [string, unknown[]];

export const handleBooleanFormat = (schema: IR.SchemaObject): Expression => {
  if (hasConstValue(schema)) {
    return createConstantValidator(schema.const);
  }
  return createBooleanValidator();
};

const hasConstValue = (schema: IR.SchemaObject): boolean => {
  return schema.const !== undefined;
};

const createConstantValidator = (value: unknown): Expression => {
  return chainMethods('joi', ['valid', [value]]);
};

const createBooleanValidator = (): Expression => {
  const validations: BooleanValidation[] = ['boolean'];
  return chainMethods('joi', ...validations);
};

export const isBooleanSchema = (schema: IR.SchemaObject): boolean => {
  return schema.type === 'boolean';
};
