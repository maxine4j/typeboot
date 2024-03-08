import { TypebootRouteDescriptor, type ConstructableTypebootComponentDescriptor } from "../types";
import { initialiseComponents } from "./components";
import { startHttpApi } from "./http";

export const boot = (args: {
  components: ConstructableTypebootComponentDescriptor[],
  routes: TypebootRouteDescriptor[],
}) => {
  const initialisedComponents = initialiseComponents(args.components);
  void startHttpApi(args.routes, initialisedComponents);
  console.log("Typeboot: Successfully booted all components")
}
