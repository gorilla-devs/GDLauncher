// @flow

import axios from 'axios';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { CURSEFORGE_MODLOADERS_API, META_PATH, INSTANCES_PATH } from '../constants';
import { arraify } from './strings';

const makeRequest = async (url: string, params: {} = {}) => {
  const requestPayload = {
    params
  };
  try {
    const response = await axios.get(url, requestPayload);
    return response.data;
  } catch (err) {
    log.error(err);
  }
};

export const getForgeVersionJSON = async (forgeVersion: string) => {
  const url = `https://addons-ecs.forgesvc.net/api/v2/minecraft/modloader/forge-${forgeVersion}`;
  return makeRequest(url);
};

export const checkForgeMeta = async (forgeVersion: string) => {
  return JSON.parse(
    await promisify(fs.readFile)(
      path.join(
        META_PATH,
        'net.minecraftforge',
        `forge-${forgeVersion}`,
        `forge-${forgeVersion}.json`
      )
    )
  )
}

export const checkForgeDownloaded = async (forgePath: string) => {
  return promisify(fs.access)(
    path.join(
      INSTANCES_PATH,
      'libraries',
      ...arraify(forgePath)
    )
  )
}