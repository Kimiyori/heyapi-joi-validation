import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { SchemaHandler } from '../base';

type BooleanValidation = string | [string, unknown[]];

export class BooleanSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'boolean';
  }

  public execute(schema: IR.SchemaObject): Expression {
    if (this.hasConstValue(schema)) {
      return this.createConstantValidator(schema.const);
    }
    return this.createBooleanValidator();
  }

  private hasConstValue(schema: IR.SchemaObject): boolean {
    return schema.const !== undefined;
  }

  private createConstantValidator(value: unknown): Expression {
    return chainMethods('joi', ['valid', [value]]);
  }

  private createBooleanValidator(): Expression {
    const validations: BooleanValidation[] = ['boolean'];
    return chainMethods('joi', ...validations);
  }

}