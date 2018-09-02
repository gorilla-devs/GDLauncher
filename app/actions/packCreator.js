import axios from 'axios';
import * as fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import { goBack } from 'react-router-redux';
import { promisify } from 'util';
import { PACKS_PATH, GAME_VERSIONS_URL } from '../constants';
import { addToQueue } from './downloadManager';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const CREATION_COMPLETE = 'CREATION_COMPLETE';
export const START_PACK_CREATION = 'START_PACK_CREATION';

export function getVanillaMCVersions() {
  return async (dispatch) => {
    const versions = await axios.get(GAME_VERSIONS_URL);
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
  };
}

export function createPack(version, packName) {
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
    dispatch(addToQueue(packName, 'vanilla'));
    dispatch({ type: CREATION_COMPLETE });
    if (router.location.state && router.location.state.modal) {
      setTimeout(dispatch(goBack()), 160);
    }
  };
}

