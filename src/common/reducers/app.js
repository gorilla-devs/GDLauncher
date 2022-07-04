import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';

function accounts(state = [], action) {
  const index = state.findIndex(
    account => account && account.selectedProfile.id === action.id
  );
  switch (action.type) {
    case ActionTypes.UPDATE_ACCOUNT:
      return index !== -1
        ? [...state.slice(0, index), action.account, ...state.slice(index + 1)]
        : [...state, action.account];
    case ActionTypes.REMOVE_ACCOUNT:
      return state.filter(
        account => account && account.selectedProfile.id !== action.id
      );
    default:
      return state;
  }
}

// Based on account UUID
function currentAccountId(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURRENT_ACCOUNT_ID:
      return action.id;
    default:
      return state;
  }
}

function vanillaManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_VANILLA_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function fabricManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_FABRIC_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function forgeManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_FORGE_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function curseforgeCategories(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURSEFORGE_CATEGORIES_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function curseforgeVersionIds(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURSEFORGE_VERSION_IDS:
      return action.data;
    default:
      return state;
  }
}

function javaManifest(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function javaLatestManifest(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_LATEST_MANIFEST:
      return action.data;
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

function lastUpdateVersion(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_LAST_UPDATE_VERSION:
      return action.version;
    default:
      return state;
  }
}

export default combineReducers({
  accounts,
  currentAccountId,
  vanillaManifest,
  forgeManifest,
  fabricManifest,
  javaManifest,
  javaLatestManifest,
  curseforgeCategories,
  clientToken,
  isNewUser,
  lastUpdateVersion,
  curseforgeVersionIds
});
