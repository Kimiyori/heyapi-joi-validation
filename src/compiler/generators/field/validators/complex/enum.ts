import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

export const handleEnumSchema = (schema: IR.SchemaObject): Expression => {
  const allowedValues = extractEnumValues(schema.items ?? []);
  return createEnumValidator(allowedValues);
};

const extractEnumValues = (items: readonly IR.SchemaObject[]): unknown[] => {
  return items.map(extractSingleValue);
};

const extractSingleValue = (item: IR.SchemaObject): unknown => {
  if (isEnumObject(item)) {
    return item.const;
  }
  return item;
};

const isEnumObject = (item: IR.SchemaObject) => {
  return typeof item === 'object' && item.const !== 'undefined';
};

const createEnumValidator = (allowedValues: unknown[]): Expression => {
  return chainMethods('joi', ['valid', allowedValues]);
};
