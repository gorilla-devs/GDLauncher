import omit from 'lodash/omit';
import EV from 'src/common/messageEvents';
import { DB_SCHEMA } from 'src/common/persistedKeys';
import sendMessage from 'src/renderer/desktop/helpers/sendMessage';
import * as ActionTypes from './actionTypes';

function accounts(state = [], action) {
  switch (action.type) {
    case ActionTypes.INIT_STORE_VALUES:
      return action.data[DB_SCHEMA.persisted.accounts];
    case ActionTypes.UPDATE_ACCOUNT: {
      const newValue = {
        ...state,
        [action.id]: action.data
      };

      sendMessage(EV.PERSISTOR.SET_ACCOUNTS, newValue).catch(console.error);
      return newValue;
    }
    case ActionTypes.REMOVE_ACCOUNT: {
      const newValue = omit(state, [action.id]);
      sendMessage(EV.PERSISTOR.SET_ACCOUNTS, newValue).catch(console.error);
      return newValue;
    }
    default:
      return state;
  }
}

function currentAccountId(state = null, action) {
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

function showNews(state = true, action) {
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

function isNewUser(state = true, action) {
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

export default {
  showNews,
  isNewUser,
  accounts,
  currentAccountId
};
