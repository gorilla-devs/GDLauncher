import axios from 'axios';
import * as fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import _ from 'lodash';
import { promisify } from 'util';
import { message } from 'antd';
import vSort from 'version-sort';
import { PACKS_PATH, GAME_VERSIONS_URL, FORGE_PROMOS } from '../constants';
import { addToQueue } from './downloadManager';
import versionCompare from '../utils/versionsCompare';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const CREATION_COMPLETE = 'CREATION_COMPLETE';
export const DISPATCH_VANILLA_MANIFEST = 'DISPATCH_VANILLA_MANIFEST';
export const START_PACK_CREATION = 'START_PACK_CREATION';
export const GET_FORGE_MANIFEST = 'GET_FORGE_MANIFEST';

export function getVanillaMCVersions() {
  return async dispatch => {
    const versions = (await axios.get(GAME_VERSIONS_URL)).data;
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
    const promos = (await axios.get(FORGE_PROMOS)).data;
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    versions.versions.forEach(v => {
      forgeVersions[v.id] = promos
        .filter(ver => {
          // Filter out all versions below 1.6.1 until we decide to support them
          if (versionCompare(v.id, '1.6.1') === -1) return false;
          return ver.gameVersion === v.id;
        })
        .map(ver => ver.name.replace('forge-', ''));
    });

    dispatch({
      type: GET_FORGE_MANIFEST,
      payload: _.omitBy(forgeVersions, v => v.length === 0)
    });
  };
}

export function createPack(version, packName, forgeVersion = null) {
  return async dispatch => {
    dispatch({ type: START_PACK_CREATION });

    await makeDir(path.join(PACKS_PATH, packName));
    dispatch(addToQueue(packName, version, forgeVersion));
    dispatch({ type: CREATION_COMPLETE });
  };
}

export function instanceDownloadOverride(
  version,
  packName,
  forgeVersion = null
) {
  return async dispatch => {
    dispatch({ type: START_PACK_CREATION });

    try {
      await promisify(fs.access)(path.join(PACKS_PATH, packName));
    } catch (e) {
      await makeDir(path.join(PACKS_PATH, packName));
    } finally {
      dispatch(addToQueue(packName, version, forgeVersion));
      dispatch({ type: CREATION_COMPLETE });
    }
  };
}
