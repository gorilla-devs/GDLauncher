import { push } from 'connected-react-router';
import { mcAuthenticate, mcRefresh, mcValidate } from 'src/common/api';
import EV from 'src/common/messageEvents';
import sendMessage from 'src/renderer/desktop/helpers/sendMessage';
import { _getCurrentAccount } from '../selectors';
import { updateIsNewUser } from './actions';
import * as ActionTypes from './actionTypes';

export function updateAccount(uuidVal, account) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuidVal,
      account
    });
  };
}

export function updateCurrentAccountId(id) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
  };
}

export function switchToFirstValidAccount(id) {
  return async (dispatch, getState) => {
    const { accounts, currentAccountId: stateId } = getState();
    const currentAccountId = id || stateId;
    let found = null;
    for (let i = 0; i < accounts.length; i += 1) {
      if (found || accounts[i].selectedProfile.id === currentAccountId)
        continue; //eslint-disable-line
      try {
        dispatch(updateCurrentAccountId(accounts[i].selectedProfile.id));
        // eslint-disable-next-line no-await-in-loop
        await dispatch(loginWithAccessToken());
        found = accounts[i].selectedProfile.id;
      } catch {
        dispatch(
          updateAccount(accounts[i].selectedProfile.id, {
            ...accounts[i],
            accessToken: accounts[i].accessToken
          })
        );
        console.error(`Failed to validate ${accounts[i].selectedProfile.id}`);
      }
    }
    if (!found) {
      dispatch(updateCurrentAccountId(null));
    }
    return found;
  };
}

export function removeAccount(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentAccountId } = state.app;
    let newId = id;
    if (currentAccountId === id) {
      newId = await dispatch(switchToFirstValidAccount(id));
    }
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    return newId;
  };
}

export function login(username, password, redirect = true) {
  return async dispatch => {
    if (!username || !password) {
      throw new Error('No username or password provided');
    }
    try {
      const isNewUser = await sendMessage(EV.AUTH.GET_IS_NEW_USER);
      const clientToken = await sendMessage(EV.AUTH.GET_CLIENT_TOKEN);
      let data = null;
      try {
        ({ data } = await mcAuthenticate(username, password, clientToken));
      } catch (err) {
        console.error(err);
        throw new Error('Invalid username or password.');
      }

      if (!data?.selectedProfile?.id) {
        throw new Error("It looks like you didn't buy the game.");
      }
      const skinUrl = await sendMessage(
        EV.AUTH.GET_PLAYER_SKIN,
        data.selectedProfile.id
      );
      if (skinUrl) {
        data.skin = skinUrl;
      }
      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (!isNewUser) {
        if (redirect) {
          dispatch(push('/home'));
        }
      } else {
        sendMessage(EV.AUTH.SET_IS_NEW_USER, false);
        if (redirect) {
          dispatch(push('/onboarding'));
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  };
}

export function loginWithAccessToken(redirect = true) {
  return async (dispatch, getState) => {
    const state = getState();
    const currentAccount = _getCurrentAccount(state);
    const { accessToken, clientToken, selectedProfile } = currentAccount;
    if (!accessToken) throw new Error();
    try {
      await mcValidate(accessToken, clientToken);
      try {
        const skinUrl = await sendMessage(
          EV.AUTH.GET_PLAYER_SKIN,
          selectedProfile.id
        );
        if (skinUrl) {
          dispatch(
            updateAccount(selectedProfile.id, {
              ...currentAccount,
              skin: skinUrl
            })
          );
        }
      } catch (err) {
        console.warn('Could not fetch skin');
      }
      dispatch(push('/home'));
    } catch (error) {
      console.error(error);
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data } = await mcRefresh(accessToken, clientToken);
          const skinUrl = await sendMessage(
            EV.AUTH.GET_PLAYER_SKIN,
            data.selectedProfile.id
          );
          if (skinUrl) {
            data.skin = skinUrl;
          }
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(updateCurrentAccountId(data.selectedProfile.id));
          if (redirect) {
            dispatch(push('/home'));
          }
        } catch (nestedError) {
          console.error(error, nestedError);
          if (redirect) {
            dispatch(push('/'));
          }
          throw new Error();
        }
      } else if (error.message === 'Network Error') {
        if (redirect) {
          dispatch(push('/home'));
        }
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser }
    } = getState();

    const vnlJson = await sendMessage(
      EV.AUTH.GET_MC_VANILLA_LAUNCHER_PROFILES_FROM_FILE
    );
    try {
      const { clientToken } = vnlJson;
      const { account } = vnlJson.selectedUser;
      const { accessToken } = vnlJson.authenticationDatabase[account];

      const { data } = await mcRefresh(accessToken, clientToken);
      const skinUrl = await sendMessage(
        EV.AUTH.GET_PLAYER_SKIN,
        data.selectedProfile.id
      );
      if (skinUrl) {
        data.skin = skinUrl;
      }

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[account].accessToken = data.accessToken;

      await sendMessage(
        EV.AUTH.SET_MC_VANILLA_LAUNCHER_PROFILES_FROM_FILE,
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push('/onboarding'));
      } else {
        dispatch(push('/home'));
      }
    } catch (err) {
      throw new Error(err);
    }
  };
}
