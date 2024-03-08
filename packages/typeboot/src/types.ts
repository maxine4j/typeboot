export type { Context as HttpRequestContext } from "koa";

export type TypebootRole
  = 'component'
  | 'router'

export interface TypebootComponentDescriptor {
  name: string
  dependencies: string[]
  roles: TypebootRole[]
}

export interface TypebootRouteDescriptor {
  routerComponentName: string
  routerMethodName: string
  httpMethod: string
  path: string
}

export interface ConstructableTypebootComponentDescriptor extends TypebootComponentDescriptor {
  objectConstructor: new (...args: any[]) => any
}
