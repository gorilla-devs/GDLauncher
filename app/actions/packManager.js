import axios from 'axios';
import * as fs from 'fs';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME } from '../constants';

export const GET_MC_VANILLA_VERSIONS = 'GET_MC_VANILLA_VERSIONS';
export const GET_MC_VANILLA_VERSION_DATA = 'GET_MC_VANILLA_VERSION_DATA';
export const RESET_MODAL_STATUS = 'RESET_MODAL_STATUS';

export function getVanillaMCVersions() {
  const versions = axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json');
  return (dispatch) => {
    dispatch({
      type: GET_MC_VANILLA_VERSIONS,
      payload: versions
    });
  };
}

export function createPack(url, packName) {
  const versionData = axios.get(url).then((response) => {
    // CREA LA CARTELLA DEL PACCHETTO SE NON ESISTE
    if (!fs.existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`)) {
      fs.mkdirSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/`);
      fs.writeFileSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/vnl.json`, JSON.stringify(response.data));
    }
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
