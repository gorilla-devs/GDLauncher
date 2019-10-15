import { createSelector } from "reselect";
import memoize from "lodash.memoize";

const _instances = state => state.instances;
const _accounts = state => state.app.accounts;
const _currentAccountId = state => state.app.currentAccountId;

export const _getInstance = createSelector(
  _instances,
  instances => memoize(instance => instances.find(v => v.name === instance))
);

export const _getCurrentAccount = createSelector(
  _accounts,
  _currentAccountId,
  (accounts, currentAccountId) =>
    accounts.find(account => account.selectedProfile.id === currentAccountId)
);
