import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { SchemaHandler } from '../base';

type NumberValidation = string | [string, unknown[]];

interface NumberConstraints {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
}

export class NumberSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'number' || schema.type === 'integer';
  }

  public execute(schema: IR.SchemaObject): Expression {
    const validations = this.buildNumberValidations(schema);
    return chainMethods('joi', ...validations);
  }

  private buildNumberValidations(schema: IR.SchemaObject): NumberValidation[] {
    const validations: NumberValidation[] = ['number'];

    this.addIntegerValidation(validations, schema.type);
    this.addRangeValidations(validations, schema);

    return validations;
  }

  private addIntegerValidation(validations: NumberValidation[], type?: string): void {
    if (type === 'integer') {
      validations.push('integer');
    }
  }

  private addRangeValidations(
    validations: NumberValidation[],
    constraints: NumberConstraints
  ): void {
    this.addMinimumValidation(validations, constraints);
    this.addMaximumValidation(validations, constraints);
  }

  private addMinimumValidation(
    validations: NumberValidation[],
    { minimum, exclusiveMinimum }: NumberConstraints
  ): void {
    if (minimum !== undefined) {
      validations.push(['min', [minimum]]);
    } else if (exclusiveMinimum !== undefined) {
      validations.push(['greater', [exclusiveMinimum]]);
    }
  }

  private addMaximumValidation(
    validations: NumberValidation[],
    { maximum, exclusiveMaximum }: NumberConstraints
  ): void {
    if (maximum !== undefined) {
      validations.push(['max', [maximum]]);
    } else if (exclusiveMaximum !== undefined) {
      validations.push(['less', [exclusiveMaximum]]);
    }
  }
}
