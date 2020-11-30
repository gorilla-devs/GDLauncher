import EV from 'src/common/messageEvents';
import { DB_SCHEMA, persistedKeys } from 'src/common/persistedKeys';
import sendMessage from 'src/renderer/desktop/helpers/sendMessage';
import * as ActionTypes from './actionTypes';

const defaultAccounts = persistedKeys.find(
  v => v.key === DB_SCHEMA.persisted.accounts
);
function accounts(state = defaultAccounts.default, action) {
  const index = state.findIndex(
    account => account && account?.selectedProfile?.id === action.id
  );
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.accounts];
    case ActionTypes.UPDATE_ACCOUNT: {
      const newValue =
        index !== -1
          ? [
              ...state.slice(0, index),
              action.account,
              ...state.slice(index + 1)
            ]
          : [...state, action.account];

      sendMessage(EV.PERSISTOR.SET_ACCOUNTS, newValue).catch(console.error);
      return newValue;
    }
    case ActionTypes.REMOVE_ACCOUNT: {
      const newValue = state.filter(
        account => account && account?.selectedProfile?.id !== action.id
      );
      sendMessage(EV.PERSISTOR.SET_ACCOUNTS, newValue).catch(console.error);
      return newValue;
    }
    default:
      return state;
  }
}

const defaultAccountId = persistedKeys.find(
  v => v.key === DB_SCHEMA.persisted.currentAccountId
);
function currentAccountId(state = defaultAccountId, action) {
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.currentAccountId];
    case ActionTypes.UPDATE_CURRENT_ACCOUNT_ID: {
      const newValue = action.value;
      sendMessage(EV.PERSISTOR.SET_CURRENT_ACCOUNT_ID, newValue).catch(
        console.error
      );
      return action.value;
    }
    default:
      return state;
  }
}

const defaultshowNews = persistedKeys.find(
  v => v.key === DB_SCHEMA.persisted.showNews
);
function showNews(state = defaultshowNews, action) {
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.showNews];
    case ActionTypes.UPDATE_SHOW_NEWS: {
      const newValue = action.value;
      sendMessage(EV.PERSISTOR.SET_SHOW_NEWS, newValue).catch(console.error);
      return newValue;
    }
    default:
      return state;
  }
}

const defaultIsNewUser = persistedKeys.find(
  v => v.key === DB_SCHEMA.persisted.isNewUser
);
function isNewUser(state = defaultIsNewUser, action) {
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.isNewUser];
    case ActionTypes.UPDATE_IS_NEW_USER: {
      const newValue = action.value;
      sendMessage(EV.PERSISTOR.SET_IS_NEW_USER, newValue).catch(console.error);
      return newValue;
    }
    default:
      return state;
  }
}

const defaultPotatoPcMode = persistedKeys.find(
  v => v.key === DB_SCHEMA.persisted.potatoPcMode
);
function potatoPcMode(state = defaultPotatoPcMode, action) {
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.potatoPcMode];
    case ActionTypes.UPDATE_POTATO_PC: {
      const newValue = action.value;
      sendMessage(EV.PERSISTOR.GET_POTATO_PC_MODE, newValue).catch(
        console.error
      );
      return newValue;
    }
    default:
      return state;
  }
}

export default {
  showNews,
  isNewUser,
  accounts,
  currentAccountId,
  potatoPcMode
};
