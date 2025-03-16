import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field';

import { SchemaHandler } from '../base';

type ObjectValidation = string | [string, unknown[]];
type PropertyValidators = Record<string, Expression>;

export class ObjectSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'object';
  }

  public execute(schema: IR.SchemaObject): Expression {
    const validations = this.buildObjectValidations(schema);
    return chainMethods('joi', ...validations);
  }

  private buildObjectValidations(schema: IR.SchemaObject): ObjectValidation[] {
    const validations: ObjectValidation[] = ['object'];

    if (schema.properties !== undefined && schema.properties) {
      this.addPropertyValidations(validations, schema);
    }

    return validations;
  }

  private addPropertyValidations(validations: ObjectValidation[], schema: IR.SchemaObject): void {
    if (!schema.properties) return;
    const propertyValidators = this.createPropertyValidators(schema.properties);
    if (schema.pattern) {
      const patternStr = schema.pattern.replace(/^\/|\/$/g, '');
      validations.push(['pattern', [new RegExp(patternStr), propertyValidators]]);
    } else {
      validations.push(['keys', [propertyValidators]]);
    }
  }

  private createPropertyValidators(
    properties: Record<string, IR.SchemaObject>
  ): PropertyValidators {
    const result = Object.fromEntries(
      Object.entries(properties).map(([key, schema]) => [key, generateFieldType(schema)])
    );
    return result;
  }
}
