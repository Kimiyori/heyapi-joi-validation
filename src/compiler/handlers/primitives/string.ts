import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { SchemaHandler } from '../base';

type StringValidation = string | [string, unknown[]];
type FormatMapping = Record<string, string>;

const STRING_FORMATS: FormatMapping = {
  'date-time': 'isoDate',
  date: 'date',
  email: 'email',
  uri: 'uri',
  uuid: 'uuid',
  time: 'isoTime',
} as const;

export class StringSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return schema.type === 'string';
  }

  public execute(schema: IR.SchemaObject): Expression {
    if (schema.const) {
      return this.createConstantStringValidator(schema.const);
    }

    const validations = this.buildStringValidations(schema);
    return chainMethods('joi', ...validations);
  }

  private createConstantStringValidator(value: unknown): Expression {
    return chainMethods('joi', ['valid', [value]]);
  }

  private buildStringValidations(schema: IR.SchemaObject): StringValidation[] {
    const validations: StringValidation[] = ['string'];

    this.addFormatValidation(validations, schema.format);
    this.addLengthValidations(validations, schema);
    this.addPatternValidation(validations, schema.pattern);

    return validations;
  }

  private addFormatValidation(validations: StringValidation[], format: string | undefined): void {
    if (format && format in STRING_FORMATS) {
      validations.push(STRING_FORMATS[format]);
    }
  }

  private addLengthValidations(validations: StringValidation[], schema: IR.SchemaObject): void {
    if (schema.minLength !== undefined) {
      validations.push(['min', [schema.minLength]]);
    }

    if (schema.maxLength !== undefined) {
      validations.push(['max', [schema.maxLength]]);
    }
  }

  private addPatternValidation(validations: StringValidation[], pattern: string | undefined): void {
    if (pattern) {
      validations.push(['pattern', [new RegExp(pattern)]]);
    }
  }
}
