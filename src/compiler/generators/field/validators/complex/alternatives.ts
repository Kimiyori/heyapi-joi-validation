import { IR } from '@hey-api/openapi-ts';

import { chainMethods, createMethodCall } from '@/compiler/ast/factory';
import { generateFieldType } from '@/compiler/generators/field/generateFieldType';

export const handleAlternatives = (items: readonly IR.SchemaObject[]) => {
  const nonNullSchemas = filterNonNullSchemas(items);

  if (hasNullableSchemas(items, nonNullSchemas)) {
    return handleNullableAlternatives(nonNullSchemas);
  }

  return createStandardAlternatives(items);
};

const filterNonNullSchemas = (schemas: readonly IR.SchemaObject[]): IR.SchemaObject[] => {
  return schemas.filter((item) => item.type !== 'null');
};

const hasNullableSchemas = (
  originalSchemas: readonly IR.SchemaObject[],
  nonNullSchemas: readonly IR.SchemaObject[]
): boolean => {
  return originalSchemas.length !== nonNullSchemas.length;
};

const handleNullableAlternatives = (nonNullSchemas: IR.SchemaObject[]) => {
  if (nonNullSchemas.length === 1) {
    return createSingleNullableType(nonNullSchemas[0]);
  }
  return createMultipleNullableTypes(nonNullSchemas);
};

const createSingleNullableType = (schema: IR.SchemaObject) => {
  return createMethodCall(generateFieldType(schema), 'allow', [null]);
};

const createMultipleNullableTypes = (schemas: IR.SchemaObject[]) => {
  return chainMethods(
    'joi',
    'alternatives',
    ['try', schemas.map(generateFieldType)],
    ['allow', [null]]
  );
};

const createStandardAlternatives = (schemas: readonly IR.SchemaObject[]) => {
  return chainMethods('joi', 'alternatives', ['try', schemas.map(generateFieldType)]);
};
