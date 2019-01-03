import { START_INSTANCESERVER } from "../actions/serverManager";


const initialState = {
  packName: "",
  pid: 0
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case `${START_INSTANCESERVER}`:
      return {
        ...state,
        packName: action.packName,
        pid: action.pid
      };
    default:
      return state;
  }
}
