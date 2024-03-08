import ts from "typescript";
import { TypebootRouteDescriptor } from "../types";
import { ParsedComponent } from "./components";
import { selectChildNodes } from "../typescript/ast";
import { ParsedDecorator, parseDecorators } from "./decorator";
import { isPresent } from "../util/array";

export type ParsedRoute = TypebootRouteDescriptor;

const isRouter = ({ roles }: ParsedComponent) => roles.includes('router');

const isTypebootRouteDecorator = (decorator: ParsedDecorator) => decorator.name === 'TypebootRoute';

const tryParseRequestHandlers = (routerComponentName: string, methodNode: ts.MethodDeclaration): ParsedRoute | undefined => {
  const routerMethodName = (methodNode.name as ts.Identifier).text;
  const routeDecorators = parseDecorators(methodNode).filter(isTypebootRouteDecorator);
  if (routeDecorators.length === 0) return;
  if (routeDecorators.length > 1) throw new Error(`Typeboot: Route method must not have more than one TypebootRoute decorator: ${routerComponentName}::${routerMethodName}`) 
  const [httpMethod, path] = routeDecorators[0].arguments;

  return {
    routerComponentName,
    routerMethodName,
    httpMethod,
    path,
  }
}

export const parseRoutes = (components: ParsedComponent[]): ParsedRoute[] =>
  components
    .filter(isRouter)
    .flatMap(({ name, node }) => 
      selectChildNodes(node, ts.isMethodDeclaration)
        .map(node => tryParseRequestHandlers(name, node))
        .filter(isPresent)
    );
