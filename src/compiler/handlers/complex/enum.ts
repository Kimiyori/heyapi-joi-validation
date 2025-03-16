import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { SchemaHandler } from '../base';

export class EnumSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'enum';
  }

  public execute(schema: IR.SchemaObject): Expression {
    const allowedValues = this.extractEnumValues(schema.items ?? []);
    return this.createEnumValidator(allowedValues);
  }

  private extractEnumValues(items: readonly IR.SchemaObject[]): unknown[] {
    return items.map((item) => this.extractSingleValue(item));
  }

  private extractSingleValue(item: IR.SchemaObject): unknown {
    if (this.isEnumObject(item)) {
      return item.const;
    }
    return item;
  }

  private isEnumObject(item: IR.SchemaObject) {
    return typeof item === 'object' && item.const !== 'undefined';
  }

  private createEnumValidator(allowedValues: unknown[]): Expression {
    return chainMethods('joi', ['valid', allowedValues]);
  }
}
