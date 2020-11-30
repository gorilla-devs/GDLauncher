import { DB_SCHEMA } from 'src/common/persistedKeys';
import * as ActionTypes from './actionTypes';

function vanillaManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.INIT_MANIFESTS:
      return action.data[DB_SCHEMA.manifests.mcVersions];
    default:
      return state;
  }
}

function fabricManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.INIT_MANIFESTS:
      return action.data[DB_SCHEMA.manifests.fabric];
    default:
      return state;
  }
}

function forgeManifest(state = [], action) {
  switch (action.type) {
    case ActionTypes.INIT_MANIFESTS:
      return action.data[DB_SCHEMA.manifests.forge];
    default:
      return state;
  }
}

function curseforgeCategories(state = [], action) {
  switch (action.type) {
    case ActionTypes.INIT_MANIFESTS:
      return action.data[DB_SCHEMA.manifests.addonCategories];
    default:
      return state;
  }
}

function javaManifest(state = {}, action) {
  switch (action.type) {
    case ActionTypes.INIT_MANIFESTS:
      return action.data[DB_SCHEMA.manifests.java];
    default:
      return state;
  }
}

export default {
  vanillaManifest,
  fabricManifest,
  forgeManifest,
  curseforgeCategories,
  javaManifest
};
