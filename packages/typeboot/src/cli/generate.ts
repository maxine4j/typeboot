import * as ts from "typescript";
import * as path from "path";
import { _array, _functionCall, _id, _import, _object, _string } from "../code-gen/statements";
import { writeStatementsToString } from "../code-gen/writer";

const diagFormatter = {
  getCanonicalFileName: (fileName: string) => fileName,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
}

console.log(__dirname)

function getTsFilesInProject(tsConfigPath: string): string[] {

  // Load tsconfig.json file
  const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

  if (configFile.error) {
      throw new Error("Error while reading tsconfig.json: " + ts.formatDiagnostics([configFile.error], diagFormatter));
  }

  // Parse the JSON configuration file
  const configParseResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsConfigPath));

  if (configParseResult.errors.length > 0) {
      throw new Error("Error parsing tsconfig.json: " + ts.formatDiagnostics(configParseResult.errors, diagFormatter));
  }

  return configParseResult.fileNames;
}

// Create an empty array to hold the statements
console.log(writeStatementsToString([
  _import("typeboot", ["boot"]),
  // import customer components
  // ...,
  // generate dependencies array passed to boot from annotations
  _functionCall("boot", [
    _array([
      _object({ 
        name: _string("FooService"), 
        _constructor: _id("FooService"),
        dependencies: _array([]),
      }),
      _object({ 
        name: _string("FooRouter"), 
        _constructor: _id("FooRouter"),
        dependencies: _array([_string("FooService")]),
      }),
    ])
  ])
]));

const tsconfigPath = process.argv[2];
console.log(getTsFilesInProject(path.join(process.cwd(), tsconfigPath)));
