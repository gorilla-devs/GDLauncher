import { START_SERVER } from "../actions/serverManager";
import { STOP_SERVER } from "../actions/serverManager";


const initialState = {
  packName: null,
  pid: null,
  process: null
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case `${START_SERVER}`:
      return {
        ...state,
        packName: action.packName,
        pid: action.pid,
        process: action.process
      };
      case `${STOP_SERVER}`:
      return {
        ...state,
        packName: null,
        pid: null
      };
    default:
      return state;
  }
}
