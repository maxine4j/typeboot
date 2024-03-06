import ts from "typescript";

export const formatTsError = (errors: ts.Diagnostic[]) => ts.formatDiagnostics(errors, {
  getCanonicalFileName: fileName => fileName,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
});
