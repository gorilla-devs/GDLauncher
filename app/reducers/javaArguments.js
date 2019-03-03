import {
  SET_GLOBAL_ARGUMENTS
} from '../actions/javaArguments';

import os from 'os';

const initialState = {
  Jarguments: null
};

export default function setArgs(state = initialState, action) {
  switch (action.type) {
    case `${SET_GLOBAL_ARGUMENTS}`:
      return {
        ...state,
        Jarguments: action.payload
      };
    default:
      return state;
  }
}
