import { push } from 'connected-react-router';
import axios from 'axios';
import EV from 'src/common/messageEvents';
import sendMessage from 'src/renderer/desktop/helpers/sendMessage';
import { NEWS_URL } from 'src/common/utils/constants';
import * as ActionTypes from './actionTypes';

export const updateShowNews = showNews => {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_NEWS,
      showNews
    });
  };
};

export const updateCurrentAccountId = id => {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
    return sendMessage(EV.AUTH.SET_CURRENT_ACCOUNT_ID, id);
  };
};

export const removeAccount = id => {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    const { accounts } = getState();
    await sendMessage(EV.AUTH.LOGOUT, id);
    if (Object.keys(accounts).length === 0) {
      dispatch(push('/'));
    }
  };
};

export const initNews = () => {
  return async (dispatch, getState) => {
    const {
      news,
      loading: { fetchingNews }
    } = getState();
    if (news.length === 0 && !fetchingNews.isRequesting) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: `https://minecraft.net${item.default_tile.image.imageURL}`,
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 12)
        });
      } catch (err) {
        console.error(err.message);
      }
    }
  };
};

export const initAccounts = (accounts, currentAccountId) => {
  return dispatch => {
    for (const accountId in accounts || {}) {
      dispatch({
        type: ActionTypes.UPDATE_ACCOUNT,
        id: accountId,
        data: accounts[accountId]
      });
    }
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      value: currentAccountId || null
    });
  };
};

export const loginMinecraftAccount = (username, password, redirect) => {
  return async dispatch => {
    const result = await sendMessage(EV.AUTH.LOGIN_WITH_USERNAME_PASSWORD, [
      username,
      password
    ]);
    const isNewUser = await sendMessage(EV.AUTH.IS_NEW_USER);
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: result?.selectedProfile?.id,
      data: result
    });
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      value: result?.selectedProfile?.id
    });

    if (redirect) {
      if (isNewUser) {
        dispatch(push('/onboarding'));
      } else {
        dispatch(push('/home'));
      }
    }
  };
};

export const loginThroughNativePlatform = redirect => {
  return async dispatch => {
    try {
      const result = await sendMessage(EV.AUTH.LOGIN_THROUGH_NATIVE_PLATFORM);
      const isNewUser = await sendMessage(EV.AUTH.IS_NEW_USER);
      dispatch({
        type: ActionTypes.UPDATE_ACCOUNT,
        id: result?.selectedProfile?.id,
        data: result
      });
      dispatch({
        type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
        value: result?.selectedProfile?.id
      });

      if (redirect) {
        if (isNewUser) {
          dispatch(push('/onboarding'));
        } else {
          dispatch(push('/home'));
        }
      }
    } catch {
      if (redirect) {
        dispatch(push('/'));
      }
    }
  };
};

export const loginWithAccessToken = redirect => {
  return async dispatch => {
    try {
      const result = await sendMessage(EV.AUTH.VALIDATE_CURRENT_ACCOUNT);
      if (!result) throw new Error('Could not verify access token');
      const isNewUser = await sendMessage(EV.AUTH.IS_NEW_USER);
      dispatch({
        type: ActionTypes.UPDATE_ACCOUNT,
        id: result?.selectedProfile?.id,
        data: result
      });
      dispatch({
        type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
        value: result?.selectedProfile?.id
      });

      if (redirect) {
        if (isNewUser) {
          dispatch(push('/onboarding'));
        } else {
          dispatch(push('/home'));
        }
      }
    } catch {
      if (redirect) {
        dispatch(push('/'));
      }
    }
  };
};
