import ts from "typescript";

export const selectNodes = <T extends ts.Node>(program: ts.Program, selector: (node: ts.Node) => node is T): Array<{ sourceFile: ts.SourceFile, node: T }> =>
  program.getSourceFiles()
    .filter(sourceFile => !sourceFile.isDeclarationFile)
    .flatMap(sourceFile => selectChildNodes(sourceFile, selector)
      .map(childNode => ({
        sourceFile,
        node: childNode,
      })));

export const selectChildNodes = <T extends ts.Node>(node: ts.Node, selector: (node: ts.Node) => node is T): T[] => {
  const constructors: T[] = [];
  const visitNode = (node: ts.Node) => {
    if (selector(node)) {
      constructors.push(node);
    }
    ts.forEachChild(node, visitNode);
  }
  ts.forEachChild(node, visitNode);
  return constructors;
};
