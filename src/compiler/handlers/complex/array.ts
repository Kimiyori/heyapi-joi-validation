import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field';

import { SchemaHandler } from '../base';

type ArrayValidation = string | [string, unknown[]];

interface ArrayConstraints {
  items?: readonly IR.SchemaObject[];
  minItems?: number;
  maxItems?: number;
}

export class ArraySchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'array';
  }

  public execute(schema: IR.SchemaObject): Expression {
    const validations = this.buildArrayValidations(schema);
    return chainMethods('joi', ...validations);
  }

  private buildArrayValidations(schema: ArrayConstraints): ArrayValidation[] {
    const validations: ArrayValidation[] = ['array'];

    this.addItemsValidation(validations, schema.items);
    this.addSizeValidations(validations, schema);
    return validations;
  }

  private addItemsValidation(
    validations: ArrayValidation[],
    items?: readonly IR.SchemaObject[]
  ): void {
    if (items?.length) {
      validations.push(['items', items.map(generateFieldType)]);
    }
  }

  private addSizeValidations(
    validations: ArrayValidation[],
    { minItems, maxItems }: ArrayConstraints
  ): void {
    if (minItems !== undefined) {
      validations.push(['min', [minItems]]);
    }

    if (maxItems !== undefined) {
      validations.push(['max', [maxItems]]);
    }
  }
}
