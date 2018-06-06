import { LOGIN, LOGOUT } from '../actions/auth';

const initialState = {
  loading: false,
  username: "killpowa",
  accessToken: "null",
  clientToken: "null",
  uuid: "null",
  isAuthValid: true
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case `${LOGIN}_PENDING`:
      return { ...state, loading: true };
    case `${LOGIN}_FULFILLED`:
      // If logged return data
      if (action.payload.data !== undefined &&
        action.payload.data !== null &&
        Object.prototype.hasOwnProperty.call(action.payload.data, 'authenticated')) {
        return {
          ...state,
          username: action.payload.data.username,
          accessToken: action.payload.data.accessToken,
          clientToken: action.payload.data.clientToken,
          uuid: action.payload.data.uuid,
          loading: false,
          isAuthValid: true
        };
      }
      // else return default not logged
      return {
        ...state,
        loading: false,
        isAuthValid: false
      };
    case `${LOGIN}_REJECTED`:
      return { ...state, loading: false };
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
