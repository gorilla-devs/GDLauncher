import { createSelector } from 'reselect';

const instances = state => state.instances;
const latestModsUpdates = state => state.latestModsUpdates;
const accounts = state => state.app.accounts;
const currentAccountId = state => state.app.currentAccountId;

export const getInstance = instance => createSelector(
  instances,
  instances => instances.find(v => v.name === instance)
)

export const hasLocalUpdate = projectID => createSelector(
  latestModsUpdates,
  latestModsUpdates => latestModsUpdates.find(v => v.projectID === projectID)
)

export const getCurrentAccount = createSelector(
  accounts, currentAccountId,
  (accounts, currentAccountId) => accounts.find(account => account.selectedProfile.id === currentAccountId)
);