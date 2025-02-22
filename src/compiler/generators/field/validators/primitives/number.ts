import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';



type NumberValidation = string | [string, unknown[]];

interface NumberConstraints {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
}

export const handleNumberFormat = (schema: IR.SchemaObject): Expression => {
  const validations = buildNumberValidations(schema);
  return chainMethods('joi', ...validations);
};

const buildNumberValidations = (schema: IR.SchemaObject): NumberValidation[] => {
  const validations: NumberValidation[] = ['number'];

  addIntegerValidation(validations, schema.type);
  addRangeValidations(validations, schema);

  return validations;
};

const addIntegerValidation = (validations: NumberValidation[], type?: string): void => {
  if (type === 'integer') {
    validations.push('integer');
  }
};

const addRangeValidations = (
  validations: NumberValidation[],
  constraints: NumberConstraints
): void => {
  addMinimumValidation(validations, constraints);
  addMaximumValidation(validations, constraints);
};

const addMinimumValidation = (
  validations: NumberValidation[],
  { minimum, exclusiveMinimum }: NumberConstraints
): void => {
  if (minimum !== undefined) {
    validations.push(['min', [minimum]]);
  } else if (exclusiveMinimum !== undefined) {
    validations.push(['greater', [exclusiveMinimum]]);
  }
};

const addMaximumValidation = (
  validations: NumberValidation[],
  { maximum, exclusiveMaximum }: NumberConstraints
): void => {
  if (maximum !== undefined) {
    validations.push(['max', [maximum]]);
  } else if (exclusiveMaximum !== undefined) {
    validations.push(['less', [exclusiveMaximum]]);
  }
};

export const isNumberSchema = (schema: IR.SchemaObject): boolean => {
  return schema.type === 'number' || schema.type === 'integer';
};
