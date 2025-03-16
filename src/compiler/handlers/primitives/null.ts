import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { SchemaHandler } from '../base';

export class NullSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'null';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(_schema: IR.SchemaObject): Expression {
    return chainMethods('joi', ['valid', [null]]);
  }
}
