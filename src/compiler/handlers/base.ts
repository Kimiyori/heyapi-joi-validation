import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

export interface SchemaHandler {
  canHandle(schema: IR.SchemaObject): boolean;
  execute(schema: IR.SchemaObject): Expression;
}
