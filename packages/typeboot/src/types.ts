export interface BootComponent {
  name: string
  _constructor: new (...args: any[]) => any
  dependencies: string[]
}

export type TypebootMetadata = {
  componentRole: 
    | 'serviceClass'
    | 'injectParam' 
    | 'controllerClass'
}
