import path from "path";
import ts from "typescript";
import fs from "fs";
import { _array, _functionCall, _id, _import, _object, _string, writeStatementsToString } from "../typescript/writer";
import { loadTsConfig } from "../typescript/config";
import type { ConstructableTypebootComponentDescriptor, TypebootRouteDescriptor } from "../types";
import { groupBy } from "../util/array";
import { resolveRelativeImportPath, stripTsExtension } from "../util/path";
import { ParsedComponent, parseComponents } from "./components";
import { boot } from "../runtime/boot";
import { ParsedRoute, parseRoutes } from "./routes";

const sourceCliArgs = () => ({
  tsconfigPath: process.argv[2] ?? 'tsconfig.json',
  outfilePath: process.argv[3] ?? 'src/boot.ts',
});

const generateDependencyImportStatements = (components: ParsedComponent[], outfile: string): ts.Statement[] => {
  const formatModuleImportSpecifier = (sourceFile: ts.SourceFile) =>
    stripTsExtension(resolveRelativeImportPath(outfile, path.relative(process.cwd(), sourceFile.fileName)))

  const componentsByModuleImportSpecifier = components
    .map(component => ({
      objectName: component.name,
      moduleImportSpecifier: formatModuleImportSpecifier(component.sourceFile),
    }))
    .reduce(groupBy('moduleImportSpecifier'), {})

  return Object.entries(componentsByModuleImportSpecifier)
    .map(([moduleImportSpecifier, components]) => _import(moduleImportSpecifier, components.map(component => component.objectName)));
}

const generateComponentDescriptorObjectExpressions = (components: ParsedComponent[]) => components
  .map(({ dependencies, name, roles }) => _object({ 
    name: _string(name), 
    objectConstructor: _id(name),
    dependencies: _array(dependencies.map(({ type }) => type).map(_string)),
    roles: _array(roles.map(_string)),
  } satisfies Record<keyof ConstructableTypebootComponentDescriptor, ts.Expression>));

const generateRouteDescriptorObjectExpressions = (routes: ParsedRoute[]) => routes
  .map(({ routerComponentName, routerMethodName, httpMethod, path }) => _object({ 
    routerComponentName: _string(routerComponentName), 
    routerMethodName: _string(routerMethodName),
    httpMethod: _string(httpMethod),
    path: _string(path),
  } satisfies Record<keyof TypebootRouteDescriptor, ts.Expression>));

export const generate = () => {
  const { tsconfigPath, outfilePath } = sourceCliArgs();

  const tsconfig = loadTsConfig(tsconfigPath);
  const program = ts.createProgram({
    rootNames: tsconfig.fileNames,
    options: tsconfig.options,
  });

  const components = parseComponents(program);
  const routes = parseRoutes(components);

  const bootTs = writeStatementsToString([
    _import("typeboot", ["boot"]),
    ...generateDependencyImportStatements(components, outfilePath),
    _functionCall("boot", [_object({
      components: _array(generateComponentDescriptorObjectExpressions(components)),
      routes: _array(generateRouteDescriptorObjectExpressions(routes)),
    } satisfies Record<keyof Parameters<typeof boot>[0], ts.Expression>)])
  ]);

  fs.writeFileSync(outfilePath, bootTs);
  console.log(`Typeboot: Successfully generated boot script`, {
    outfilePath: path.join(process.cwd(), outfilePath), 
    componentsCount: components.length, 
    routesCount: routes.length,
  });
};

generate();
