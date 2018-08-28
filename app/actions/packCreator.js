import axios from 'axios';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { goBack } from 'react-router-redux';
import { promisify } from 'util';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, GAME_VERSIONS_URL, APPPATH } from '../constants';
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
    const packsPath = `${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`;
    const response = await axios.get(versionURL);
    // CREATE PACK FOLDER IF iT DOES NOT EXISt
    if (!await promisify(fs.exists)(`${packsPath}/${packName}/`)) {
      mkdirp.sync(`${packsPath}/${packName}/`);
      await promisify(fs.writeFile)(`${packsPath}/${packName}/vnl.json`, JSON.stringify(response.data));
    }
    dispatch(addToQueue(packName, 'vanilla'));
    dispatch({ type: CREATION_COMPLETE });
    if (router.location.state && router.location.state.modal) {
      setTimeout(dispatch(goBack()), 160);
    }
  };
}

