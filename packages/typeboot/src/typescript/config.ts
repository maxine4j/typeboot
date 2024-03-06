import ts from "typescript";
import path from "path";
import { formatTsError } from "./diagnostics";

export const loadTsConfig = (tsConfigPath: string) => {
  const rawConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  if (rawConfig.error) {
    throw new Error(`Error while reading tsconfig.json: ${formatTsError([rawConfig.error])}`);
  }
  const parsedConfig = ts.parseJsonConfigFileContent(rawConfig.config, ts.sys, path.dirname(tsConfigPath));
  if (parsedConfig.errors.length > 0) {
    throw new Error(`Error parsing tsconfig.json: ${formatTsError(parsedConfig.errors)}`);
  }

  return parsedConfig;
};
