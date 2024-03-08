import { ConstructableTypebootComponentDescriptor, type TypebootComponentDescriptor } from "../types";

export const initialiseComponents = (componentDescriptors: ConstructableTypebootComponentDescriptor[]) => {
  
  const initialisedComponents = new Map<string, object>();
  let previousInitialisedComponentCount = initialisedComponents.size;

  const capturePreviousState = () => previousInitialisedComponentCount = initialisedComponents.size;
  const failedToInitialiseMoreComponents = () => previousInitialisedComponentCount === initialisedComponents.size;
  const allComponentsHaveBeenInitialised = () => initialisedComponents.size === componentDescriptors.length;
  const hasBeenInisialised = (componentName: string) => initialisedComponents.has(componentName);

  const tryInitialiseComponents = () => {
    const initialiseComponent = (component: ConstructableTypebootComponentDescriptor) => {
      const initialisedDependencies = component.dependencies.map(dependency => initialisedComponents.get(dependency))
      initialisedComponents.set(component.name, new component.objectConstructor(...initialisedDependencies));
    }

    for (const component of componentDescriptors) {
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
      throw formatFailedToBootError(componentDescriptors, initialisedComponents);
    }
    capturePreviousState();
  }

  return initialisedComponents;
}

const formatFailedToBootError = (componentDescriptors: TypebootComponentDescriptor[], initialisedComponents:  Map<string, object>) => {
  const missingComponents = componentDescriptors.filter(component => !initialisedComponents.has(component.name));

  const missingDependencyErrorMessages = missingComponents.map(component => {
    const missingDependencies = component.dependencies
      .map(dependency => ({ dependency, initialisedComponent: initialisedComponents.get(dependency) }))
      .filter(({ initialisedComponent }) => initialisedComponent === undefined)
      .map(({ dependency }) => dependency);
    return `"${component.name}" is missing: ${JSON.stringify(missingDependencies)}; `;
  });

  return `Typeboot: Failed to boot. The following components could not be initialised: \n${JSON.stringify(missingDependencyErrorMessages, null, 2)}`;
};
