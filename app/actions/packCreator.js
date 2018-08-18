import axios from 'axios';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { goBack } from 'react-router-redux';
import { promisify } from 'util';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, GAME_VERSIONS_URL, APPPATH } from '../constants';
import { addToQueue } from './downloadManager';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const CREATION_COMPLETE = 'CREATION_COMPLETE';
export const RESET_MODAL_STATE = 'RESET_MODAL_STATE';

export function getVanillaMCVersions() {
  return async (dispatch) => {
    const versions = await axios.get(GAME_VERSIONS_URL);
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
  };
}

export function resetModalState() {
  return dispatch => {
    dispatch({
      type: RESET_MODAL_STATE
    });
  };
}

export function createPack(url, packName) {
  return async (dispatch) => {
    const packsPath = `${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`;
    const response = await axios.get(url);
    // CREATE PACK FOLDER IF iT DOES NOT EXISt
    if (!await promisify(fs.exists)(`${packsPath}/${packName}/`)) {
      mkdirp.sync(`${packsPath}/${packName}/`);
      await promisify(fs.writeFile)(`${packsPath}/${packName}/vnl.json`, JSON.stringify(response.data));
    }
    dispatch(addToQueue(packName, 'vanilla'))
    dispatch({ type: CREATION_COMPLETE })
    setTimeout(dispatch(goBack()), 160);
  };
}

