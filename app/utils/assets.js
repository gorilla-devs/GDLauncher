import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import makeDir from 'make-dir';
import { promisify } from 'util';

// This copies all the required assets to the "virtual" folder inside the assets folder
// This is needed for "virtual" assets versions
export const copyAssetsToLegacy = async assets => {
  await Promise.map(assets, async asset => {
    try {
      await promisify(fs.access)(asset.legacyPath);
    } catch {
      await makeDir(path.dirname(asset.legacyPath));
      await promisify(fs.copyFile)(asset.path, asset.legacyPath);
    }
  });
};

// This copies all the required assets to the "resources" folder inside the instance
// This is needed for "pre-1.6" assets versions
export const copyAssetsToResources = async assets => {
  await Promise.map(assets, async asset => {
    try {
      await promisify(fs.access)(asset.resourcesPath);
    } catch {
      await makeDir(path.dirname(asset.resourcesPath));
      await promisify(fs.copyFile)(asset.path, asset.resourcesPath);
    }
  });
};
