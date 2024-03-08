import ts from "typescript";

export interface ParsedDecorator {
  name: string
  arguments: string[];
}

const parseName = (decoratorNode: ts.Decorator) =>
  (decoratorNode.expression as any)?.escapedText as string
  ?? (decoratorNode.expression as any)?.expression?.escapedText as string

const parseArguments = (decoratorNode: ts.Decorator) => (decoratorNode.expression as any)?.arguments
  ?.map((argument: any) => argument?.text) as string[] 

export const parseDecorators = (node: ts.Node): ParsedDecorator[] => {
  if (!ts.isClassDeclaration(node) && !ts.isMethodDeclaration(node)) return [];
  if (!node.modifiers) return [];

  return node.modifiers.filter(ts.isDecorator)
    .map(decorator => ({ 
      name: parseName(decorator),
      arguments: parseArguments(decorator) ?? [],
    }));
};
