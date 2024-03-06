import { type BootComponent } from "./types";

export const boot = (components: BootComponent[]) => {

  const initialisedComponents = new Map<string, object>();
  let previousInitialisedComponentCount = initialisedComponents.size;

  const capturePreviousState = () => previousInitialisedComponentCount = initialisedComponents.size;
  const failedToInitialiseMoreComponents = () => previousInitialisedComponentCount === initialisedComponents.size;
  const allComponentsHaveBeenInitialised = () => initialisedComponents.size === components.length;
  const hasBeenInisialised = (componentName: string) => initialisedComponents.has(componentName);

  const formatFailedToBootError = () => {
    const missingComponents = components.filter(component => !hasBeenInisialised(component.name));

    const missingDependencyErrorMessages = missingComponents.map(component => {
      const missingDependencies = component.dependencies
        .map(dependency => ({ dependency, initialisedComponent: initialisedComponents.get(dependency) }))
        .filter(({ initialisedComponent }) => initialisedComponent === undefined)
        .map(({ dependency }) => dependency);
      return `"${component.name}" is missing: ${JSON.stringify(missingDependencies)}; `;
    });

    return `Typeboot: Failed to boot. The following components could not be initialised: \n${JSON.stringify(missingDependencyErrorMessages, null, 2)}`;
  }

  const tryInitialiseComponents = () => {
    const initialiseComponent = (component: BootComponent) => {
      const initialisedDependencies = component.dependencies.map(dependency => initialisedComponents.get(dependency))
      initialisedComponents.set(component.name, new component._constructor(...initialisedDependencies));
    }

    for (const component of components) {
      if (hasBeenInisialised(component.name)) continue;
      if (component.dependencies.every(hasBeenInisialised)) {
        initialiseComponent(component);
      }
    }
  }

  while (true) {
    tryInitialiseComponents();
    if (allComponentsHaveBeenInitialised()) break;
    if (failedToInitialiseMoreComponents()) {
      throw formatFailedToBootError();
    }
    capturePreviousState();
  }

  console.log("Typeboot: Successfully booted all components")
}
