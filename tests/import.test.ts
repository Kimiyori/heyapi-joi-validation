import { describe, expect, test } from '@jest/globals';
import { ImportDeclaration, NamedImports, SyntaxKind } from 'typescript';

import { createDefaultImportStatement, createNamedImportStatement } from '@/compiler/ast/import';

describe('createDefaultImportStatement', () => {
  test('valid import name and module name', () => {
    const importName = 'joi';
    const moduleName = 'joi';
    const result = createDefaultImportStatement({ importName, moduleName });
    expect(result.kind).toBe(SyntaxKind.ImportDeclaration);
    expect(result.importClause?.name?.kind).toBe(SyntaxKind.Identifier);
    expect(result.moduleSpecifier.kind).toBe(SyntaxKind.StringLiteral);
  });
  test('empty import name', () => {
    const importName = '';
    const moduleName = 'joi';
    expect(() => createDefaultImportStatement({ importName, moduleName })).toThrow();
  });
  test('empty module name', () => {
    const importName = 'joi';
    const moduleName = '';
    expect(() => createDefaultImportStatement({ importName, moduleName })).toThrow();
  });
});

describe('createNamedImportStatement', () => {
  // Helper function to perform common assertions
  const assertImportStructure = (result: ImportDeclaration, importNamesLength: number) => {
    expect(result.kind).toBe(SyntaxKind.ImportDeclaration);
    expect(result.importClause?.namedBindings?.kind).toBe(SyntaxKind.NamedImports);
    const namedImports = result.importClause?.namedBindings as NamedImports;
    expect(namedImports.elements.length).toBe(importNamesLength);
  };

  test('single import name', () => {
    const importNames = ['foo'];
    const moduleName = 'bar';
    const result = createNamedImportStatement({ importNames, moduleName });
    assertImportStructure(result, 1);
  });

  test('multiple import names', () => {
    const importNames = ['foo', 'bar', 'baz'];
    const moduleName = 'qux';
    const result = createNamedImportStatement({ importNames, moduleName });
    assertImportStructure(result, 3);

    const namedImports = result.importClause?.namedBindings as NamedImports;
    importNames.forEach((name, index) => {
      expect(namedImports.elements[index].name.text).toBe(name);
    });
  });

  test('import names with aliases', () => {
    const importNames = [{ name: 'foo', alias: 'bar' }, 'baz'];
    const moduleName = 'qux';
    const result = createNamedImportStatement({ importNames, moduleName });
    assertImportStructure(result, 2);
  });

  test('empty import names array', () => {
    const importNames: string[] = [];
    const moduleName = 'bar';
    const result = createNamedImportStatement({ importNames, moduleName });
    assertImportStructure(result, 0);
  });

  test('invalid moduleName (empty string)', () => {
    const importNames = ['foo'];
    const moduleName = '';
    expect(() => createNamedImportStatement({ importNames, moduleName })).toThrow();
  });
});
