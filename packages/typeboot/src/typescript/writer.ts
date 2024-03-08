import ts from "typescript";

export const writeStatementsToString = (statements: ts.Statement[]) => {
  const eof = ts.factory.createToken(ts.SyntaxKind.EndOfFileToken);
  const sourceFile = ts.factory.createSourceFile(statements, eof, ts.NodeFlags.None)
  return ts.createPrinter().printFile(sourceFile);
}

export const _import = (moduleSpecifier: string, namedImports: string[]) => ts.factory.createImportDeclaration(
  undefined,
  ts.factory.createImportClause(
    false,
    undefined,
    ts.factory.createNamedImports(
      namedImports.map(namedImport => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(namedImport))),
    ),
  ),
  ts.factory.createStringLiteral(moduleSpecifier)
);

export const _functionCall = (name: string, argumentsArray: readonly ts.Expression[]) => ts.factory.createExpressionStatement(
  ts.factory.createCallExpression(
    ts.factory.createIdentifier(name),
    undefined,
    argumentsArray,
  )
);

export const _id = (name: string) => ts.factory.createIdentifier(name);

export const _string = (str: string) => ts.factory.createStringLiteral(str);

export const _array = (elements: ts.Expression[]) => ts.factory.createArrayLiteralExpression(elements, true);

export const _object = (properties: Record<string, ts.Expression>) => ts.factory.createObjectLiteralExpression(
  Object.entries(properties).map(([key, value]) => ts.factory.createPropertyAssignment(key, value)),
  true
);
