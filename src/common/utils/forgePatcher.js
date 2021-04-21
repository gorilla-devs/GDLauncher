import forgeExceptions from './forgeExceptions';

const forgePatcher = (forgeVersion, minecraftVersion) => {
  return forgeExceptions[forgeVersion] || `${minecraftVersion}-${forgeVersion}`;
};

export default forgePatcher;
