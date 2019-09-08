import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';
import { DEFAULT_ARGS } from '../constants';

function accounts(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ACCOUNT:
      const index = state.findIndex(account => account.selectedProfile.id === action.id);
      return (
        (index !== -1
          ? [
            ...state.slice(0, index),
            action.account,
            ...state.slice(index + 1),
          ]
          : [...state, action.account]
        )
      );
    case ActionTypes.REMOVE_ACCOUNT:
      return accounts.filter(account => account.selectedProfile.id !== action.id);
    default:
      return state;
  }
}

function currentAccountIndex(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURRENT_ACCOUNT_INDEX:
      return action.index;
    default:
      return state;
  }
};

function vanillaManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_VANILLA_MANIFEST:
      return action.data;
    default:
      return state;
  }
};

function forgeManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_FORGE_MANIFEST:
      return action.data;
    default:
      return state;
  }
};

function modsManifests(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_MODS_MANIFESTS:
      const index = state.findIndex(mod => mod.id === action.id);
      return (
        (index !== -1
          ? [
            ...state.slice(0, index),
            action.mod,
            ...state.slice(index + 1),
          ]
          : [...state, action.mod]
        )
      );
    case ActionTypes.REMOVE_MOD_MANIFEST:
      return accounts.filter(mod => mod.id !== action.id);
    default:
      return state;
  }
}

function clientToken(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CLIENT_TOKEN:
      return action.clientToken;
    default:
      return state;
  }
}

function isNewUser(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_IS_NEW_USER:
      return action.isNewUser;
    default:
      return state;
  }
}

function showChangelog(state = false, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SHOW_CHANGELOG:
      return action.show;
    default:
      return state;
  }
}

export default combineReducers({
  accounts,
  currentAccountIndex,
  vanillaManifest,
  forgeManifest,
  modsManifest,
  clientToken,
  isNewUser,
  showChangelog
});