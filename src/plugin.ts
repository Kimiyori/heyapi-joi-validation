import type { Plugin } from '@hey-api/openapi-ts';

import { createDefaultImportStatement } from '@/compiler/ast/import';
import { dependencyGraph } from '@/compiler/core/dependencyGraph';
import { generateOperationValidators } from '@/compiler/generators/operation';
import { generateJoiValidator } from '@/compiler/generators/schema';
import { Config } from '@/types';

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  const importStmt = createDefaultImportStatement({
    importName: 'joi',
    moduleName: 'joi',
  });
  file.add(importStmt);

  context.subscribe('operation', (operationData) => {
    const validators = generateOperationValidators(operationData);
    validators.forEach((validator) => file.add(validator));
  });
  context.subscribe('schema', (schema) => {
    dependencyGraph.addSchema(schema.name, schema);
  });

  context.subscribe('after', () => {
    const sortedSchemas = dependencyGraph.getSortedSchemas();
    sortedSchemas.forEach((schema) => {
      const sourceFile = generateJoiValidator(schema);
      file.add(sourceFile);
    });
  });
};
