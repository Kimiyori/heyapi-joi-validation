import { IR } from '@hey-api/openapi-ts';

export type RemoveReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};
export type SchemaObject = {
  $ref: string;
  name: string;
  schema: IR.SchemaObject;
};
