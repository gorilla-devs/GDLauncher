import axios from 'axios';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { goBack } from 'react-router-redux';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, GAME_VERSIONS_URL } from '../constants';
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
  return (dispatch) => {
    return axios.get(url).then((response) => {
      // CREATE PACK FOLDER IF iT DOES NOT EXISt
      if (!fs.existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`)) {
        mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`);
        fs.writeFileSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/vnl.json`, JSON.stringify(response.data));
      }
      return response;
    })
      .then(dispatch(addToQueue(packName, 'vanilla')))
      .then(dispatch({ type: CREATION_COMPLETE }))
      .then(setTimeout(dispatch(goBack()), 160));
  };
}

