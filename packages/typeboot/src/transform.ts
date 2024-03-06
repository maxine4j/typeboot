import ts from "typescript";

console.log('loaded the typeboot transform module')

export const transform = (): ts.TransformerFactory<ts.SourceFile> => {
  return (context: ts.TransformationContext) => {

    return (file: ts.SourceFile): ts.SourceFile => {
      if (file.isDeclarationFile) return file;
    
      return ts.visitEachChild(
        file,
        (node) => node,
        context,
      );
    };
  }
}

export default transform;
