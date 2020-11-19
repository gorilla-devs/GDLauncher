import { createSelector } from 'reselect';

const _accounts = state => state.accounts;
const _currentAccountId = state => state.currentAccountId;

// eslint-disable-next-line
export const _getCurrentAccount = createSelector(
  _accounts,
  _currentAccountId,
  (accounts, currentAccountId) => accounts[currentAccountId]
);
