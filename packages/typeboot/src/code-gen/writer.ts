import ts from "typescript";

export const writeStatementsToString = (statements: ts.Statement[]) => {
  const eof = ts.factory.createToken(ts.SyntaxKind.EndOfFileToken);
  const sourceFile = ts.factory.createSourceFile(statements, eof, ts.NodeFlags.None)
  return ts.createPrinter().printFile(sourceFile);
}
