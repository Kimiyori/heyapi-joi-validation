import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';



type StringValidation = string | [string, unknown[]];
type FormatMapping = Record<string, string>;

const STRING_FORMATS: FormatMapping = {
  'date-time': 'isoDate',
  date: 'date',
  email: 'email',
  uri: 'uri',
  uuid: 'uuid',
  time: 'isoTime',
} as const;

export const handleStringFormat = (schema: IR.SchemaObject): Expression => {
  if (schema.const) {
    return createConstantStringValidator(schema.const);
  }

  const validations = buildStringValidations(schema);
  return chainMethods('joi', ...validations);
};

const createConstantStringValidator = (value: unknown): Expression => {
  return chainMethods('joi', ['valid', [value]]);
};

const buildStringValidations = (schema: IR.SchemaObject): StringValidation[] => {
  const validations: StringValidation[] = ['string'];

  addFormatValidation(validations, schema.format);
  addLengthValidations(validations, schema);
  addPatternValidation(validations, schema.pattern);

  return validations;
};

const addFormatValidation = (validations: StringValidation[], format: string | undefined): void => {
  if (format && format in STRING_FORMATS) {
    validations.push(STRING_FORMATS[format]);
  }
};

const addLengthValidations = (validations: StringValidation[], schema: IR.SchemaObject): void => {
  if (schema.minLength !== undefined) {
    validations.push(['min', [schema.minLength]]);
  }

  if (schema.maxLength !== undefined) {
    validations.push(['max', [schema.maxLength]]);
  }
};

const addPatternValidation = (
  validations: StringValidation[],
  pattern: string | undefined
): void => {
  if (pattern) {
    validations.push(['pattern', [new RegExp(pattern)]]);
  }
};

// Type guard to check if schema is string type
export const isStringSchema = (schema: IR.SchemaObject): boolean => {
  return schema.type === 'string';
};
