import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods, createIdentifier } from '@/compiler/ast/factory';
import { schemaContext } from '@/compiler/core/context/schemaContext';
import { createSchemaName, getSchemaNameFromRef } from '@/compiler/utils/naming';

import { SchemaHandler } from '../base';

export class RefSchemaHandler implements SchemaHandler {
  public canHandle(schema: IR.SchemaObject): boolean {
    return !!schema.$ref;
  }

  public execute(schema: IR.SchemaObject): Expression {
    const ref = schema.$ref as string;
    const refName = getSchemaNameFromRef(ref);

    if (schemaContext.isSelfReference(refName)) {
      return chainMethods('joi', ['link', [createSchemaName('#' + refName)]]);
    }
    return createIdentifier(createSchemaName(getSchemaNameFromRef(ref)));
  }
}
