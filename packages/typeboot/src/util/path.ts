export const resolveRelativeImportPath = (sourceModule: string, importedModule: string): string => {
  const sourceSegments = sourceModule.split('/');
  const importedSegments = importedModule.split('/');

  // Find common segments
  let commonIndex = 0;
  while (sourceSegments[commonIndex] === importedSegments[commonIndex] && commonIndex < sourceSegments.length) {
    commonIndex++;
  }

  // Calculate relative path
  const upLevels = sourceSegments.length - commonIndex - 1;
  const relativePrefix = upLevels === 0 ? ['.'] : Array(upLevels).fill('..');;
  return [...relativePrefix, ...importedSegments.slice(commonIndex)].join('/');
};

export const stripTsExtension = (filePath: string) => filePath.replace(/\.ts$/, '');
