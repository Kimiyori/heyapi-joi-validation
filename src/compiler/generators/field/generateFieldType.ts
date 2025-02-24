import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods, createIdentifier } from '@/compiler/ast/factory';
import {
  handleAlternatives,
  handleArraySchema,
  handleBooleanFormat,
  handleEnumSchema,
  handleLogicalCombination,
  handleNumberFormat,
  handleObjectFormat,
  handleStringFormat,
  handleTupleSchema,
  isLogicalAnd,
  isLogicalOr,
} from '@/compiler/generators/field/validators';
import { createSchemaName, getSchemaNameFromRef } from '@/compiler/utils/naming';

export const generateFieldType = (schema: IR.SchemaObject): Expression => {
  if (schema.$ref) {
    return createIdentifier(createSchemaName(getSchemaNameFromRef(schema.$ref)));
  }

  if (isLogicalOr(schema)) {
    return handleAlternatives(schema.items || []);
  }
  if (isLogicalAnd(schema)) {
    return handleLogicalCombination(schema);
  }

  switch (schema.type) {
    case 'string':
      return handleStringFormat(schema);
    case 'number':
    case 'integer':
      return handleNumberFormat(schema);
    case 'undefined':
      return chainMethods('joi', 'any', ['valid', [undefined]]);
    case 'boolean':
      return handleBooleanFormat(schema);
    case 'null':
      return chainMethods('joi', ['valid', [null]]);
    case 'array':
      return handleArraySchema(schema);
    case 'tuple':
      return handleTupleSchema(schema);
    case 'enum':
      return handleEnumSchema(schema);
    case 'object':
      return handleObjectFormat(schema);
    default:
      return chainMethods('joi', 'any');
  }
};
