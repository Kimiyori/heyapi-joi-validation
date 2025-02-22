import {
    createPrinter,
    createSourceFile,
    EmitHint,
    Node,
    ScriptKind,
    ScriptTarget
} from 'typescript';

export const getResultAsString = (generatedCode: Node) => {
  const printer = createPrinter();

  const sourceFile = createSourceFile('test.ts', '', ScriptTarget.Latest, false, ScriptKind.TS);

  return printer.printNode(EmitHint.Unspecified, generatedCode, sourceFile);
};
