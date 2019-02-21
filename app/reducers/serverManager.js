import { START_SERVER } from "../actions/serverManager";
import { STOP_SERVER } from "../actions/serverManager";


const initialState = {
  servers: {},
  process: null
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case `${START_SERVER}`:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.packName]: {
            pid: action.pid,
          }
        }
      };
    case `${STOP_SERVER}`:
      return {
        ...state,
        servers:  _.omit(state.servers, action.packName)
      };
    default:
      return state;
  }
}
