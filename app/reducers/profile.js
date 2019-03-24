import {
  SET_STATE_ONLINE,
  SET_STATE_AWAY,
  SET_STATE_BUSY
} from '../actions/profile';

const initialState = {
  profileState: 'Online',
  stateColor: '#2ecc71'
};

export default function profile(state = initialState, action) {
  switch (action.type) {
    case SET_STATE_ONLINE:
      return {
        ...state,
        profileState: 'Online',
        stateColor: '#2ecc71'
      };
    case SET_STATE_AWAY:
      return {
        ...state,
        profileState: 'Away',
        stateColor: '#faad14'
      };
    case SET_STATE_BUSY:
      return {
        ...state,
        profileState: 'Busy',
        stateColor: '#f5222d'
      };
    default:
      return state;
  }
}
