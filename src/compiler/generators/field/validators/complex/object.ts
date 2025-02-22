import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';


type ObjectValidation = string | [string, unknown[]];
type PropertyValidators = Record<string, Expression>;

export const handleObjectFormat = (schema: IR.SchemaObject): Expression => {
  const validations = buildObjectValidations(schema);
  return chainMethods('joi', ...validations);
};

const buildObjectValidations = (schema: IR.SchemaObject): ObjectValidation[] => {
  const validations: ObjectValidation[] = ['object'];

  if (schema.properties !== undefined && schema.properties) {
    addPropertyValidations(validations, schema.properties);
  }

  return validations;
};

const addPropertyValidations = (
  validations: ObjectValidation[],
  properties: Record<string, IR.SchemaObject>
): void => {
  const propertyValidators = createPropertyValidators(properties);
  validations.push(['keys', [propertyValidators]]);
};

const createPropertyValidators = (
  properties: Record<string, IR.SchemaObject>
): PropertyValidators => {
  return Object.fromEntries(
    Object.entries(properties).map(([key, schema]) => [key, generateFieldType(schema)])
  );
};
