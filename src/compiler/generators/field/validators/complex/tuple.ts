import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';
export const handleTupleSchema = (schema: IR.SchemaObject): Expression => {
  const orderedItems = schema.items ?? [];
  return createTupleValidator(orderedItems);
};

const createTupleValidator = (items: readonly IR.SchemaObject[]): Expression => {
  const itemValidators = items.map(generateFieldType);
  return chainMethods('joi', 'array', ['ordered', itemValidators]);
};
