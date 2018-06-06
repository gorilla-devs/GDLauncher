import axios from 'axios';

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

export function getVanillaMCVersionData(url) {
  const versionData = axios.get(url);
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
