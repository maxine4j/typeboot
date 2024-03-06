
interface Component {
  name: string
  objectConstructor: new (...args: any[]) => any
  dependencies: string[]
}

export const boot = (components: Component[]) => {

  const initialisedComponents = new Map<string, object>();

  const hasBeenInisialised = (componentName: string) => initialisedComponents.has(componentName);
  
  const initialiseComponent = (component: Component) => {
    const initialisedDependencies = component.dependencies.map(dependency => initialisedComponents.get(dependency))
    const missingDependencies = initialisedDependencies.filter(d => d === undefined);
    if (missingDependencies.length > 0) {
      throw new Error(`Typeboot: Failed to initialise component "${component.name}". The following dependencies are missing: ${JSON.stringify(missingDependencies)}`);
    }
    initialisedComponents.set(component.name, new component.objectConstructor(...initialisedDependencies));
  }

  const tryInitialiseComponents = () => {
    for (const component of components) {
      if (hasBeenInisialised(component.name)) continue;
      if (component.dependencies.every(hasBeenInisialised)) {
        initialiseComponent(component);
      }
    }
  }

  let previousInitialisedCount = initialisedComponents.size;
  const failedToInitialiseMoreComponents = () => previousInitialisedCount === initialisedComponents.size;
  const allComponentsHaveBeenInitialised = () => initialisedComponents.size === components.length;

  while (true) {
    tryInitialiseComponents();
    if (allComponentsHaveBeenInitialised()) break;
    if (failedToInitialiseMoreComponents()) {
      const missingComponents = components.filter(component => !hasBeenInisialised(component.name)).map(component => component.name);
      throw new Error(`Typeboot: Failed to boot. The following components could not be initialised: ${JSON.stringify(missingComponents)}, ${JSON.stringify({
        initialisedComponents,
        previousInitialisedCount,
        components
      })}`)
    }
    previousInitialisedCount = initialisedComponents.size;
  }

  console.log("Successfully booted all components")
}
