import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field';

import { SchemaHandler } from '../base';

export class TupleSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'tuple';
  }

  public execute(schema: IR.SchemaObject): Expression {
    const orderedItems = schema.items ?? [];
    return this.createTupleValidator(orderedItems);
  }

  private createTupleValidator(items: readonly IR.SchemaObject[]): Expression {
    const itemValidators = items.map(generateFieldType);
    return chainMethods('joi', 'array', ['ordered', itemValidators]);
  }
}
