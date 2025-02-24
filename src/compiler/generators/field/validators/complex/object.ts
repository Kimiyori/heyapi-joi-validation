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
    addPropertyValidations(validations, schema);
  }

  return validations;
};

const addPropertyValidations = (validations: ObjectValidation[], schema: IR.SchemaObject): void => {
  if (!schema.properties) return;
  const propertyValidators = createPropertyValidators(schema.properties);
  if (schema.pattern) {
    const patternStr = schema.pattern.replace(/^\/|\/$/g, '');
    validations.push(['pattern', [new RegExp(patternStr), propertyValidators]]);
  } else {
    validations.push(['keys', [propertyValidators]]);
  }
};

const createPropertyValidators = (
  properties: Record<string, IR.SchemaObject>
): PropertyValidators => {
  const result = Object.fromEntries(
    Object.entries(properties).map(([key, schema]) => [key, generateFieldType(schema)])
  );
  return result;
};
