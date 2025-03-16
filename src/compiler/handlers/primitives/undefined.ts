import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';


import { chainMethods } from '@/compiler/ast/factory';
import { SchemaHandler } from '@/compiler/handlers/base';

export class UndefinedSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'undefined';
  }

  public execute(_schema: IR.SchemaObject): Expression {
    return chainMethods('joi', 'any', ['valid', [undefined]]);
  }
}
