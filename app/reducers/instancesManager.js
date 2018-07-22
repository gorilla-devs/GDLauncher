import {
  SELECT_INSTANCE
} from '../actions/instancesManager';

const initialState = {
  selectedInstance: null
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case `${SELECT_INSTANCE}`:
      return {
        ...state,
        selectedInstance: action.payload
      };
    default:
      return state;
  }
}
