export const TypebootComponent: ClassDecorator = target => target;

export const TypebootHttpRouter: ClassDecorator = target => target;

// @ts-expect-error TS6133
export const TypebootRoute = (method: string, path: string): MethodDecorator => target => target;
