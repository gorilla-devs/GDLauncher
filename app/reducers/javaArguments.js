import {
  SET_GLOBALARGUMENTS
} from '../actions/javaArguments';

import { findJavaHome } from './javaHelpers';
import os from 'os';
const { settings } = getState();

const javaPath = await findJavaHome();
const dosName =
os.release().substr(0, 2) === 10
  ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
  : '';

const initialState = {
  Jarguments: null,
  defaultJarguments: `${javaPath}" -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}
  ${
    os.platform() === WINDOWS
      ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
      : ''
  }
   -Xms256m -Xmx${settings.java.memory}m`
};

export default function setArgs(state = initialState, action) {
  switch (action.type) {
    case `${SET_GLOBALARGUMENTS}`:
      return {
        ...state,
        Jarguments: action.payload
      };
    default:
      return state;
  }
}
