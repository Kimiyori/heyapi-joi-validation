import { factory, ImportDeclaration, ImportSpecifier } from 'typescript';

type createDefaultImportStatementProps = {
  importName: string;

  moduleName: string;
};

export const createDefaultImportStatement = ({
  importName,
  moduleName,
}: createDefaultImportStatementProps): ImportDeclaration => {
  if (!importName || !moduleName) {
    throw new Error('importName and moduleName must be a string');
  }

  const defaultImport = factory.createImportClause(
    false,
    factory.createIdentifier(importName.toString()),
    undefined
  );

  const moduleSpecifier = factory.createStringLiteral(moduleName.toString());

  return factory.createImportDeclaration(undefined, defaultImport, moduleSpecifier);
};

type createNamedImportStatementProps = {
  importNames: ({ name: string; alias?: string } | string)[];
  moduleName: string;
};

const createImportSpecifier = (
  item: string | { name: string; alias?: string }
): ImportSpecifier => {
  if (typeof item === 'string') {
    return factory.createImportSpecifier(false, undefined, factory.createIdentifier(item));
  }
  const { name, alias } = item;
  if (alias) {
    return factory.createImportSpecifier(
      false,
      factory.createIdentifier(name),
      factory.createIdentifier(alias)
    );
  }
  return factory.createImportSpecifier(false, undefined, factory.createIdentifier(name));
};

export const createNamedImportStatement = ({
  importNames,
  moduleName,
}: createNamedImportStatementProps) => {
  if (!moduleName) {
    throw new Error('moduleName must be a string');
  }

  const importSpecifiers = importNames.map(createImportSpecifier);
  const namedImports = factory.createNamedImports(importSpecifiers);

  const defaultImport = factory.createImportClause(false, undefined, namedImports);
  const moduleSpecifier = factory.createStringLiteral(moduleName);

  return factory.createImportDeclaration(undefined, defaultImport, moduleSpecifier);
};
