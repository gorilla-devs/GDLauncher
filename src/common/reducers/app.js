import { combineReducers } from "redux";
import * as ActionTypes from "./actionTypes";

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

function javaManifest(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_MANIFEST:
      return action.data;
    default:
      return state;
  }
}

function modsManifests(state = [], action) {
  const index = state.findIndex(mod => mod.id === action.id);
  switch (action.type) {
    case ActionTypes.UPDATE_MODS_MANIFESTS:
      return index !== -1
        ? [...state.slice(0, index), action.mod, ...state.slice(index + 1)]
        : [...state, action.mod];
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

function showChangelogs(state = false, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SHOW_CHANGELOG:
      return action.show;
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
  modsManifests,
  clientToken,
  isNewUser,
  showChangelogs
});
