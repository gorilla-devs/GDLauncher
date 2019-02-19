import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import makeDir from 'make-dir';
import { promisify } from 'util';

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
