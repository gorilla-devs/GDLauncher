import {
  LOGOUT,
  START_AUTH_LOADING,
  STOP_AUTH_LOADING,
  START_TOKEN_CHECK_LOADING,
  STOP_TOKEN_CHECK_LOADING,
  AUTH_FAILED,
  AUTH_SUCCESS,
  OPEN_NATIVE_PROFILES_MODAL
} from '../actions/auth';


const initialState = {
  loading: false,
  tokenLoading: false,
  username: null,
  accessToken: null,
  clientToken: null,
  legacy: null,
  uuid: null,
  isAuthValid: false,
  nativeProfilesModalOpened: false
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case `${OPEN_NATIVE_PROFILES_MODAL}`:
      return { ...state, nativeProfilesModalOpened: true };
    case `${START_AUTH_LOADING}`:
      return { ...state, loading: true };
    case `${STOP_AUTH_LOADING}`:
      return { ...state, loading: false };
    case `${START_TOKEN_CHECK_LOADING}`:
      return { ...state, tokenLoading: true };
    case `${STOP_TOKEN_CHECK_LOADING}`:
      return { ...state, tokenLoading: false };
    case `${AUTH_SUCCESS}`:
      return {
        ...state,
        username: action.payload.username,
        accessToken: action.payload.accessToken,
        clientToken: action.payload.clientToken,
        legacy: action.payload.legacy,
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
        legacy: null,
        uuid: null,
        isAuthValid: false
      };
    default:
      return state;
  }
}
