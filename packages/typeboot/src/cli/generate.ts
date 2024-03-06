import * as ts from "typescript";
import { _array, _functionCall, _id, _import, _object, _string } from "../typescript/statements";
import { writeStatementsToString } from "../typescript/writer";
import { loadTsConfig } from "../typescript/config";
import { type BootComponent } from "../types";
import path from "path";

const sourceCliArgs = () => ({
  tsconfigPath: process.argv[2] ?? 'tsconfig.json',
  outfile: process.argv[3] ?? 'src/boot.ts',
});

const visitNodes = <T>(program: ts.Program, callback: (node: ts.Node, sourceFile: ts.SourceFile) => T | undefined) => {
  const visitNode = (sourceFile: ts.SourceFile) => (node: ts.Node) => {
    callback(node, sourceFile);
    ts.forEachChild(node, visitNode(sourceFile));
  }

  program.getSourceFiles()
    .filter(sourceFile => !sourceFile.isDeclarationFile)
    .forEach(sourceFile => visitNode(sourceFile)(sourceFile));
};

const findClassDeclarationNodes = (program: ts.Program): Array<{ node: ts.ClassDeclaration, sourceFile: ts.SourceFile }> => {
  const nodes: Array<{ node: ts.ClassDeclaration, sourceFile: ts.SourceFile }> = [];

  visitNodes(program, (node, sourceFile) => {
    if (ts.isClassDeclaration(node)) {
      nodes.push({ node, sourceFile });
    }
  });

  return nodes;
}

const selectChildNodes = <T extends ts.Node>(node: ts.Node, selector: (node: ts.Node) => node is T) => {
  const constructors: T[] = [];
  const visitNode = (node: ts.Node) => {
    if (selector(node)) {
      constructors.push(node);
    }
    ts.forEachChild(node, visitNode);
  }
  ts.forEachChild(node, visitNode);
  return constructors;
}

const getDecorators = (node: ts.Node): ts.Decorator[] => {
  if (ts.isClassDeclaration(node)) {
    return node.modifiers?.filter(ts.isDecorator) ?? [];
  }
  return [];
}

const isTypebootDecorator = (decorator: string) => decorator.startsWith("Typeboot");

const getTypebootDecorators = (node: ts.Node): string[] => getDecorators(node)
    .map(decorator => (decorator.expression as any)?.escapedText)
    .filter(isTypebootDecorator);

const getImportPath = (sourceModule: string, importedModule: string): string => {
  const sourceSegments = sourceModule.split('/');
  const importedSegments = importedModule.split('/');

  // Find common segments
  let commonIndex = 0;
  while (sourceSegments[commonIndex] === importedSegments[commonIndex] && commonIndex < sourceSegments.length) {
    commonIndex++;
  }

  // Calculate relative path
  const upLevels = sourceSegments.length - commonIndex - 1;
  const relativePrefix = upLevels === 0 ? ['.'] : Array(upLevels).fill('..');;
  return [...relativePrefix, ...importedSegments.slice(commonIndex)].join('/');
}

const stripTsExtension = (filePath: string) => filePath.replace(/\.ts$/, '');

const createDependencyImports = (program: ts.Program, outfile: string) => {
  const components: Array<{
    node: ts.ClassDeclaration,
    name: string,
    decorator: string,
    moduleImportSpecifier: string,
  }> = [];

  const cwd = process.cwd();

  for (const { node, sourceFile } of findClassDeclarationNodes(program)) {
    for (const decorator of getTypebootDecorators(node)) {
      if (node.name === undefined) continue;
      
      const modulePath = path.relative(cwd, sourceFile.fileName);

      components.push({
        decorator,
        name: node.name.text, 
        node,
        moduleImportSpecifier: stripTsExtension(getImportPath(outfile, modulePath)),
      });
    }
  }

  const groupedImports: Record<string, Set<string>> = {};
  for (const component of components) {
    const existingImports = groupedImports[component.moduleImportSpecifier] ?? new Set();
    groupedImports[component.moduleImportSpecifier] = new Set([
      ...existingImports,
      component.name
    ]);
  }

  // TODO: add a step between grouping and outputting _imports to remove unused imports
  return Object.entries(groupedImports)
    .map(([moduleImportSpecifier, componentNames]) => _import(moduleImportSpecifier, [...componentNames]));
}

type Dependency = {
  name: string;
  type: string;
}

const getConstrutorDependencies = (classNode: ts.ClassDeclaration): Dependency[] => {
  const [constructorNode] = selectChildNodes(classNode, ts.isConstructorDeclaration);
  if (!constructorNode) return [];

  const paramNodes = selectChildNodes(constructorNode, ts.isParameter);
  if (paramNodes.length === 0) return [];

  return paramNodes.map(node => {
    const name = ts.isIdentifier(node.name) ? node.name.text : undefined;
    const type = ts.isTypeNode(node.type!) ? (node.type as any)?.typeName?.text as string : undefined;
    if (!name || !type) {
      throw Error("Failed to find name or type for constructor dependency");
    }

    return { name, type };
  });
}

const getComponentDependencies = (program: ts.Program) => {
  const components: Record<string, Dependency[]> = {};
  for (const { node } of findClassDeclarationNodes(program)) {
    for (const _decorator of getTypebootDecorators(node)) { // TODO: need a better way to apply multiple decorators
      if (node.name === undefined) continue;
      components[node.name.text] = getConstrutorDependencies(node);
    }
  }
  return components;
}

const createBootComponentObject = (component: Pick<BootComponent, 'name' | 'dependencies'>) => _object({ 
  name: _string(component.name), 
  _constructor: _id(component.name),
  dependencies: _array(component.dependencies.map(_string)),
});

const createBootDependencies = (program: ts.Program) =>
  Object.entries(getComponentDependencies(program))
    .map(([name, dependencies]) => createBootComponentObject({ name, dependencies: dependencies.map(d => d.type) }));

export const generate = () => {
  const { tsconfigPath, outfile } = sourceCliArgs();

  const tsconfig = loadTsConfig(tsconfigPath);

  const program = ts.createProgram({
    rootNames: tsconfig.fileNames,
    options: tsconfig.options,
  });

  const bootTs = writeStatementsToString([
    _import("typeboot", ["boot"]),
    ...createDependencyImports(program, outfile),
    _functionCall("boot", [
      _array(createBootDependencies(program))
    ])
  ]);

  console.log(bootTs);
};

generate();
