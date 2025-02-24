import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';


type ArrayValidation = string | [string, unknown[]];

interface ArrayConstraints {
  items?: readonly IR.SchemaObject[];
  minItems?: number;
  maxItems?: number;
}

export const handleArraySchema = (schema: IR.SchemaObject): Expression => {
  const validations = buildArrayValidations(schema);
  return chainMethods('joi', ...validations);
};

const buildArrayValidations = (schema: ArrayConstraints): ArrayValidation[] => {
  const validations: ArrayValidation[] = ['array'];

  addItemsValidation(validations, schema.items);
  addSizeValidations(validations, schema);
  return validations;
};

const addItemsValidation = (
  validations: ArrayValidation[],
  items?: readonly IR.SchemaObject[]
): void => {
  if (items?.length) {
    validations.push(['items', items.map(generateFieldType)]);
  }
};

const addSizeValidations = (
  validations: ArrayValidation[],
  { minItems, maxItems }: ArrayConstraints
): void => {
  if (minItems !== undefined) {
    validations.push(['min', [minItems]]);
  }

  if (maxItems !== undefined) {
    validations.push(['max', [maxItems]]);
  }
};
