import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods, createMethodCall } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field';

import { SchemaHandler } from '../base';

export class LogicalOrSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return !schema.type && schema.logicalOperator === 'or' && Array.isArray(schema.items ?? []);
  }

  public execute(schema: IR.SchemaObject): Expression {
    const items = schema.items || [];
    const nonNullSchemas = this.filterNonNullSchemas(items);

    if (this.hasNullableSchemas(items, nonNullSchemas)) {
      return this.handleNullableAlternatives(nonNullSchemas);
    }

    return this.createStandardAlternatives(items);
  }

  private filterNonNullSchemas(schemas: readonly IR.SchemaObject[]): IR.SchemaObject[] {
    return schemas.filter((item) => item.type !== 'null');
  }

  private hasNullableSchemas(
    originalSchemas: readonly IR.SchemaObject[],
    nonNullSchemas: readonly IR.SchemaObject[]
  ): boolean {
    return originalSchemas.length !== nonNullSchemas.length;
  }

  private handleNullableAlternatives(nonNullSchemas: IR.SchemaObject[]): Expression {
    if (nonNullSchemas.length === 1) {
      return this.createSingleNullableType(nonNullSchemas[0]);
    }
    return this.createMultipleNullableTypes(nonNullSchemas);
  }

  private createSingleNullableType(schema: IR.SchemaObject): Expression {
    return createMethodCall(generateFieldType(schema), 'allow', [null]);
  }

  private createMultipleNullableTypes(schemas: IR.SchemaObject[]): Expression {
    return chainMethods(
      'joi',
      'alternatives',
      ['try', schemas.map(generateFieldType)],
      ['allow', [null]]
    );
  }

  private createStandardAlternatives(schemas: readonly IR.SchemaObject[]): Expression {
    return chainMethods('joi', 'alternatives', ['try', schemas.map(generateFieldType)]);
  }
}
