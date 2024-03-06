// 1. load each file in a ts project
// 2. parse each file
// 3. recurse through each to find classes marked with dectorators
// 4. use controller, scheduled, worker, etc. annotations to build map of dependencies
//      we need to figure out the order in which we can create them
//      can probably loop over the map and try to recursively instantiate each until we fail, then keep going until we loop 2 times in a
//      row with no change to the number of booted components, if that is true before we finish booting then we crash

import ts from "typescript";

// Create an empty array to hold the statements
const statements: ts.Statement[] = [];

// Create a source file with the statements
const sourceFile = ts.factory.createSourceFile(statements, ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), ts.NodeFlags.None);

// Print the source file
console.log(ts.createPrinter().printFile(sourceFile));
