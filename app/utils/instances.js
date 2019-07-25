//@flow

import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import _ from 'lodash';
import { PACKS_PATH } from '../constants';

export const updateConfig = async (instanceName: string, paramsToEdit: {} | null, paramsToRemove: Array<string> | null = null) => {
  const configPath = path.join(PACKS_PATH, instanceName, 'config.json');
  const prevFileConfig = _.omit(await readConfig(instanceName), paramsToRemove);

  await promisify(fs.writeFile)(configPath, JSON.stringify({
    ...prevFileConfig,
    ...paramsToEdit
  }))
};

export const readConfig = async (instanceName: string) => {
  const configPath = path.join(PACKS_PATH, instanceName, 'config.json');
  const file = await promisify(fs.readFile)(configPath, "utf8");
  return JSON.parse(file);
};