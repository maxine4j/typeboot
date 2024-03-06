export type TypebootMetadata = {
  annotation: 'serviceClass' | 'injectParam' | 'controllerClass'
}

export type AnnotatedObject<T extends object> = T & { __typeboot: TypebootMetadata }

const annotateMetadata = <T extends object>(target: T, metadata: TypebootMetadata) => {
  (target as any).__typeboot = metadata;
  return target;
}

export const TypebootService: ClassDecorator = (target) => annotateMetadata(target, { annotation: 'serviceClass' });
export const TypebootController: ClassDecorator = (target) => annotateMetadata(target, { annotation: 'controllerClass' });
export const TypebootInject: ParameterDecorator = (target) => annotateMetadata(target, { annotation: 'injectParam' });

export { boot } from "./boot";
