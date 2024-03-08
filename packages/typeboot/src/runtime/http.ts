import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { TypebootRouteDescriptor } from '../types';
import Router from '@koa/router';

export const startHttpApi = (
  routes: TypebootRouteDescriptor[], 
  initialisedComponents: Map<string, any>
) => {

  const port = process.env.TYPEBOOT_PORT ?? 8080;

  const app = new Koa();
  const router = new Router();

  for (const route of routes) {
    const component = initialisedComponents.get(route.routerComponentName);
    if (!component) throw Error(`Typeboot: Failed to find router '${route.routerComponentName}' when initialising route: ${route.httpMethod} ${route.path}`);
    const routeHandler = component[route.routerMethodName] as (ctx: Koa.Context) => Promise<void>;

    router.register(route.path, [route.httpMethod], ctx => {
      routeHandler.bind(routeHandler)(ctx);
    })
  }

  app
    .use(bodyParser())
    .use(router.routes())
    .listen(port)
    .on('listening', () => {
      console.log(`Typeboot: Listening on ${port}`)
    });
};
