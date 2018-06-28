import {
  LOGOUT,
  START_AUTH_LOADING,
  STOP_AUTH_LOADING,
  AUTH_FAILED,
  AUTH_SUCCESS
} from '../actions/auth';

const initialState = {
  loading: false,
  username: 'killpowa',
  accessToken: 'null',
  clientToken: 'null',
  uuid: 'null',
  isAuthValid: true
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case `${START_AUTH_LOADING}`:
      return { ...state, loading: true };
    case `${STOP_AUTH_LOADING}`:
      return { ...state, loading: false };
    case `${AUTH_SUCCESS}`:
      return {
        ...state,
        username: action.payload.username,
        accessToken: action.payload.accessToken,
        clientToken: action.payload.clientToken,
        uuid: action.payload.uuid,
        isAuthValid: true
      };
    case `${AUTH_FAILED}`:
      return {
        ...state,
        isAuthValid: false
      };
    case LOGOUT:
      return {
        ...state,
        username: null,
        accessToken: null,
        clientToken: null,
        uuid: null,
        isAuthValid: false
      };
    default:
      return state;
  }
}
