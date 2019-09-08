import { createSelector } from 'reselect';

const instances = state => state.instances;
const latestModsUpdates = state => state.latestModsUpdates;

export const getInstance = instance => createSelector(
  instances,
  instances => instances.find(v => v.name === instance)
)

export const hasLocalUpdate = projectID => createSelector(
  latestModsUpdates,
  latestModsUpdates => latestModsUpdates.find(v => v.projectID === projectID)
)