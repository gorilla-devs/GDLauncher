import axios from 'axios';
import * as fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import _ from 'lodash';
import { goBack } from 'react-router-redux';
import { promisify } from 'util';
import { PACKS_PATH, GAME_VERSIONS_URL, FORGE_PROMOS } from '../constants';
import { addToQueue } from './downloadManager';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const CREATION_COMPLETE = 'CREATION_COMPLETE';
export const START_PACK_CREATION = 'START_PACK_CREATION';
export const GET_FORGE_MANIFEST = 'GET_FORGE_MANIFEST';

export function getVanillaMCVersions() {
  return async (dispatch) => {
    const versions = await axios.get(GAME_VERSIONS_URL);
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
    const promos = (await axios.get(FORGE_PROMOS)).data;
    let forgeVersions = {};
    // This reads all the numbers for each version. It replaces each number
    // with the correct forge version. It filters numbers which do not have the "installer"
    // file. It then omits empty versions (not even one valid forge version for that mc version)
    Object.keys(promos.mcversion).forEach(v => {
      forgeVersions[v] = promos.mcversion[v].filter(ver => {
        const files = promos.number[ver].files;
        for (let i = 0; i < files.length; i++) {
          if (files[i].includes("installer")) {
            return true;
          }
        }
        return false;
      }).map(ver => promos.number[ver].version);
    });
    dispatch({
      type: GET_FORGE_MANIFEST,
      payload: _.omitBy(forgeVersions, (v, k) => {
        return v.length === 0;
      })
    });
  };
}

export function createPack(version, packName, forgeVersion = null) {
  return async (dispatch, getState) => {
    const { router } = getState();
    dispatch({ type: START_PACK_CREATION });
    const versions = await axios.get(GAME_VERSIONS_URL);
    const versionURL = versions.data.versions.find((v) => v.id === version).url;
    const response = await axios.get(versionURL);
    // CREATE PACK FOLDER IF iT DOES NOT EXISt
    try {
      await promisify(fs.access)(path.join(PACKS_PATH, packName));
    } catch (e) {
      await makeDir(path.join(PACKS_PATH, packName));
    } finally {
      await promisify(fs.writeFile)(path.join(PACKS_PATH, packName, 'vnl.json'), JSON.stringify(response.data));
    }
    dispatch(addToQueue(packName, version, forgeVersion));
    dispatch({ type: CREATION_COMPLETE });
    if (router.location.state && router.location.state.modal) {
      setTimeout(dispatch(goBack()), 160);
    }
  };
}

