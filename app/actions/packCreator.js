import axios from 'axios';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, GAME_VERSIONS_URL } from '../constants';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const GET_MC_VANILLA_VERSION_DATA = 'GET_MC_VANILLA_VERSION_DATA';
export const RESET_MODAL_STATUS = 'RESET_MODAL_STATUS';

export function getVanillaMCVersions() {
  const versions = axios.get(GAME_VERSIONS_URL);
  return (dispatch) => {
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
  };
}

export function createPack(url, packName) {
  const versionData = axios.get(url).then((response) => {
    // CREATE PACK FOLDER IF iT DOES NOT EXISt
    if (!fs.existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`)) {
      mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`);
      fs.writeFileSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/vnl.json`, JSON.stringify(response.data));
    }
    return response;
  });
  return (dispatch) => {
    dispatch({
      type: GET_MC_VANILLA_VERSION_DATA,
      payload: versionData
    });
  };
}

export function resetModalStatus() {
  return (dispatch) => {
    dispatch({
      type: RESET_MODAL_STATUS
    });
  };
}
