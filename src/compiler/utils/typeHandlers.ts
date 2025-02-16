import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { generateFieldType } from '../schema/generateFieldType';

import { chainMethods } from './typeHelpers';

export const isLogicalOr = (schema: IR.SchemaObject) => {
  return !schema.type && schema.logicalOperator === 'or' && Array.isArray(schema.items ?? []);
};

export const handleAlternatives = (schema: IR.SchemaObject) => {
  return chainMethods('joi', 'alternatives', [
    'try',
    (schema.items ?? [] ?? []).map((item) => generateFieldType(item)),
  ]);
};

export const handleStringFormat = (schema: IR.SchemaObject): Expression => {
  if (schema.const) {
    return chainMethods('joi', ['valid', [schema.const]]);
  }

  const validations: Array<string | [string, unknown[]]> = ['string'];

  if (schema.format) {
    switch (schema.format) {
      case 'date-time':
        validations.push('isoDate');
        break;
      case 'date':
        validations.push('date');
        break;
      case 'email':
        validations.push('email');
        break;
      case 'uri':
        validations.push('uri');
        break;
      case 'uuid':
        validations.push('uuid');
        break;
      case 'time':
        validations.push('isoTime');
        break;
    }
  }

  if (schema.minLength !== undefined) {
    validations.push(['min', [schema.minLength]]);
  }

  if (schema.maxLength !== undefined) {
    validations.push(['max', [schema.maxLength]]);
  }

  if (schema.pattern) {
    validations.push(['pattern', [new RegExp(schema.pattern)]]);
  }

  return chainMethods('joi', ...validations);
};

export const handleNumberFormat = (schema: IR.SchemaObject): Expression => {
  const validations: Array<string | [string, unknown[]]> = ['number'];

  // Handle integer type
  if (schema.type === 'integer') {
    validations.push('integer');
  }

  // Handle minimum (min) - with exclusive
  if (schema.minimum !== undefined) {
    validations.push(['min', [schema.minimum]]);
  } else if (schema.exclusiveMinimum !== undefined) {
    validations.push(['greater', [schema.exclusiveMinimum]]);
  }

  // Handle maximum (max) - with exclusive
  if (schema.maximum !== undefined) {
    validations.push(['max', [schema.maximum]]);
  } else if (schema.exclusiveMaximum !== undefined) {
    validations.push(['less', [schema.exclusiveMaximum]]);
  }

  return chainMethods('joi', ...validations);
};

export const handleBooleanFormat = (schema: IR.SchemaObject): Expression => {
  if (schema.const !== undefined) {
    return chainMethods('joi', ['valid', [schema.const]]);
  }

  const validations: Array<string | [string, unknown[]]> = ['boolean'];

  return chainMethods('joi', ...validations);
};

export const handleArraySchema = (schema: IR.SchemaObject) => {
  const validations: Array<string | [string, unknown[]]> = ['array'];
  // Handle items validation
  if (schema.items?.length) {
    validations.push(['items', (schema.items ?? []).map((item) => generateFieldType(item))]);
  }

  // Handle min items
  if (schema.minItems !== undefined) {
    validations.push(['min', [schema.minItems]]);
  }

  // Handle max items
  if (schema.maxItems !== undefined) {
    validations.push(['max', [schema.maxItems]]);
  }
  return chainMethods('joi', ...validations);
};

export const handleTupleSchema = (schema: IR.SchemaObject) => {
  return chainMethods('joi', 'array', [
    'ordered',
    (schema.items ?? []).map((item) => generateFieldType(item)),
  ]);
};

export const handleEnumSchema = (schema: IR.SchemaObject) => {
  const allowedValues = (schema.items ?? []).map((item) =>
    typeof item === 'object' && item.const !== undefined ? item.const : item
  );
  return chainMethods('joi', ['valid', allowedValues]);
};

export const handleObjectFormat = (schema: IR.SchemaObject): Expression => {
  const validations: Array<string | [string, unknown[]]> = ['object'];

  // Handle properties if defined
  if (schema.properties) {
    const propertyValidators = Object.entries(schema.properties).map(([key, propSchema]) => [
      key,
      generateFieldType(propSchema),
    ]);
    validations.push(['keys', [Object.fromEntries(propertyValidators)]]);
  }

  return chainMethods('joi', ...validations);
};
