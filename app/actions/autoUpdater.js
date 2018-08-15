import axios from 'axios';
import * as packageJson from '../package.json';
import versionsCompare from '../utils/versionsCompare';
import { UPDATE_URL } from '../constants';

export const START_UPDATING = "START_CHECK_UPDATES";
export const STOP_UPDATING = "STOP_CHECK_UPDATES";
export const UPDATE_AVAILABLE = "UPDATE_AVAILABLE";

export function checkForUpdates() {
  return async dispatch => {
    try {
      const res = await axios.get(UPDATE_URL);
      const actualVersion = packageJson.version;
      // versionsCompare returns positive if v1 > v2, negative if v1 < v2, 0 if they're equal
      if(versionsCompare(res.data.latestVersion, actualVersion) === 1) {
        dispatch({ type: UPDATE_AVAILABLE });
      }
    } catch (err) {

    }
  }
}

