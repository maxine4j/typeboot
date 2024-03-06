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

const findConstructorParamNodes = (classNode: ts.ClassDeclaration): ts.ParameterDeclaration[] => {

  const constructorParams: ts.ParameterDeclaration[] = [];
  ts.forEachChild(classNode, node => {
    if (ts.isParameter(node)) {
      constructorParams.push(node);
    }
  })

  return constructorParams;
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

const wipParams = (program: ts.Program) => {
  for (const { node } of findClassDeclarationNodes(program)) {
    for (const _decorator of getTypebootDecorators(node)) {
      if (node.name === undefined) continue;
      console.log("AAAA", node)
    }
  }
}

export const generate = () => {
  const { tsconfigPath, outfile } = sourceCliArgs();

  const tsconfig = loadTsConfig(tsconfigPath);

  const program = ts.createProgram({
    rootNames: tsconfig.fileNames,
    options: tsconfig.options,
  });

  wipParams(program)

  const createBootComponentObject = (component: Pick<BootComponent, 'name' | 'dependencies'>) => _object({ 
    name: _string(component.name), 
    _constructor: _id(component.name),
    dependencies: _array(component.dependencies.map(_string)),
  });
  
  // have imports
  // now need to parse params for dependencies

  const bootTs = writeStatementsToString([
    _import("typeboot", ["boot"]),
    ...createDependencyImports(program, outfile),
    _functionCall("boot", [
      _array([
        createBootComponentObject({ name: 'FooService', dependencies: [] }),
        createBootComponentObject({ name: 'FooRouter', dependencies: ['FooRouter'] }),
      ])
    ])
  ]);

  console.log(bootTs);
};

generate();
