import {
  LOGOUT,
  START_AUTH_LOADING,
  STOP_AUTH_LOADING,
  START_TOKEN_CHECK_LOADING,
  STOP_TOKEN_CHECK_LOADING,
  AUTH_FAILED,
  AUTH_SUCCESS,
  START_NATIVE_LOADING,
  STOP_NATIVE_LOADING,
} from '../actions/auth';


const initialState = {
  loading: false,
  tokenLoading: false,
  nativeLoading: false,
  email: null,
  username: null,
  displayName: null,
  accessToken: null,
  clientToken: null,
  userID: null,
  newUser: null,
  legacy: null,
  uuid: null,
  isAuthValid: false,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case `${START_AUTH_LOADING}`:
      return { ...state, loading: true };
    case `${STOP_AUTH_LOADING}`:
      return { ...state, loading: false };
    case `${START_TOKEN_CHECK_LOADING}`:
      return { ...state, tokenLoading: true };
    case `${STOP_TOKEN_CHECK_LOADING}`:
      return { ...state, tokenLoading: false };
    case `${START_NATIVE_LOADING}`:
      return { ...state, nativeLoading: true };
    case `${STOP_NATIVE_LOADING}`:
      return { ...state, nativeLoading: false };
    case `${AUTH_SUCCESS}`:
      return {
        ...state,
        email: action.payload.email,
        displayName: action.payload.displayName,
        accessToken: action.payload.accessToken,
        clientToken: action.payload.clientToken,
        legacy: action.payload.legacy,
        uuid: action.payload.uuid,
        userID: action.payload.userID,
        username: action.payload.username,
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
        email: null,
        displayName: null,
        accessToken: null,
        clientToken: null,
        legacy: null,
        uuid: null,
        userID: null,
        username: null,
        isAuthValid: false
      };
    default:
      return state;
  }
}
