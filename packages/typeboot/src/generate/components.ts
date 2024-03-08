import ts from "typescript";
import { TypebootRole } from "../types"
import { selectChildNodes, selectNodes } from "../typescript/ast";
import { unique } from "../util/array";
import { ParsedDecorator, parseDecorators } from "./decorator";

export interface ParsedDependency {
  name: string
  type: string
}

export interface ParsedComponent {
  name: string
  dependencies: ParsedDependency[]
  roles: TypebootRole[]
  sourceFile: ts.SourceFile
  node: ts.ClassDeclaration
}

const toRoles = ({ name }: ParsedDecorator): TypebootRole[] => {
  switch (name) {
    case 'TypebootComponent': return ['component'];
    case 'TypebootHttpRouter': return ['component', 'router'];
    default: return [];
  }
}

const hasRole = ({ roles }: ParsedComponent) => roles.length > 0;

const parseConstructorInjectionParamDependencies = (classNode: ts.ClassDeclaration): ParsedDependency[] => {
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

export const parseComponents = (program: ts.Program): ParsedComponent[] =>
  selectNodes(program, ts.isClassDeclaration)
    .map(({ node, sourceFile }) => ({
      name: node.name?.text!,
      roles: unique(parseDecorators(node).flatMap(toRoles)),
      dependencies: parseConstructorInjectionParamDependencies(node),
      sourceFile,
      node,
    }))
    .filter(hasRole);
