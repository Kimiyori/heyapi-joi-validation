import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { dispatcher } from '@/compiler/core/dispatcher/dispatcher';

export const generateFieldType = (schema: IR.SchemaObject): Expression => {
  return dispatcher.dispatch(schema);
};
