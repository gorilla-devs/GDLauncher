import { createSelector } from 'reselect';

const instances = state => state.instancesManager.instances;

export const getInstance = instance => createSelector(
  instances,
  instances => instances.find(v => v.name === instance)
)