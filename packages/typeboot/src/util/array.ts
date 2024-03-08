export const groupBy = <TObj extends Record<string, unknown>>(key: keyof TObj) => (groupedImports: Record<string, TObj[]>, element: TObj) => {
  const group = String(element[key]);
  const existingElements = groupedImports[group] ?? new Set();
  return {
    ...groupedImports,
    [group]: [...existingElements, element],
  }
};

export const unique = <T>(values: T[]) => [...new Set(values)];

export const isPresent = <T>(value: T | undefined): value is T => value !== undefined;
