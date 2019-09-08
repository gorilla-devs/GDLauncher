import { get } from 'lodash';
import * as ActionTypes from './actionTypes';
import { minecraftLogin, minecraftCheckAccessToken, minecraftRefreshAccessToken } from '../APIs';
import { uuidv4 } from '../utils';

export function removeAccount(uuid) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      uuid
    });
  };
}

export function updateAccount(uuid, account) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      uuid,
      account
    });
  };
}

export function updateNews(news) {
  return async (dispatch, getState) => {
    const { news, loading: { loading_news } } = getState();
    if (news.length === 0 && !loading_news) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: await getArticleHeaderImage(item.article_url),
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({ type: UPDATE_NEWS, payload: newsArr.splice(0, 12) });
      } catch (err) {
        log.error(err.message);
      }
    }
  };
};

export function updateAccount(uuid, account) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuid
      account,
    });
  };
};

export function removeAccount(id) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
  };
};

export function updateIsNewUser(isNewUser) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      isNewUser
    });
  };
}

export function login(username, password, remember) {
  return async (dispatch, getState) => {
    const { app: { clientToken, isNewUser } } = getState();
    try {
      const { data, status } = await minecraftLogin(username, password);
      if (status !== 200) throw new Error();
      dispatch(updateAccount(data.selectedProfile.id, data));

      if (!isNewUser) {
        dispatch(push('/home'));
      } else {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      }
    } catch {
      message.error('Wrong username or password');
      throw new Error();
    }
  };
}

export function loginWithAccessToken(accessToken) {
  return async (dispatch, getState) => {
    const { app: { currentAccountIndex, accounts, clientToken } } = getState();
    const accessToken = accounts[currentAccountIndex].accessToken;
    try {
      const { data, status } = await minecraftCheckAccessToken(accessToken, clientToken);
      dispatch(push('/home'));
    } catch (err) {
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data, status } = await minecraftRefreshAccessToken(accessToken, clientToken);
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(push('/home'));
        } catch {
          message.error('Token Not Valid. You Need To Log-In Again :(');
          dispatch(removeAccount(data.selectedProfile.id));
          throw new Error();
        }
      } else if (error.message === 'Network Error') {
        message.info('You are offline. Logging in in offline-mode');
        dispatch(push('/home'));
      }
    }
  };
}

export function loginThroughNativeLauncher(accessToken) {
  return async (dispatch, getState) => {
    const { app: { clientToken, isNewUser } } = getState();

    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, '.minecraft');
    const vnlJson = await fsa.readJson(
      path.join(vanillaMCPath, 'launcher_profiles.json')
    );

    const { account } = vnlJson.selectedUser;
    const { accessToken } = vnlJson.authenticationDatabase[account];
    try {
      const { data, status } = await minecraftRefreshAccessToken(accessToken, clientToken);

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[
        newUserData.selectedProfile.userId
      ].accessToken = data.accessToken;
      await fsa.writeJson(
        path.join(vanillaMCPath, 'launcher_profiles.json'),
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      } else {
        dispatch(push('/home'));
      }
    } catch {
      message.error(
        'We could not log you in through Minecraft Launcher. Invalid data.'
      );
      throw new Error();
    }
  };
}

export function logout() {
  return (dispatch, getState) => {
    const { app: { currentAccountIndex, accounts } } = getState();
    const id = accounts[currentAccountIndex].selectedProfile.id;
    dispatch(removeAccount(id));
    dispatch(push('/'));
  };
}

export function checkClientToken() {
  return (dispatch, getState) => {
    const { app: { clientToken } } = getState();
    if (clientToken) return clientToken;
    const newToken = uuidv4().replace('-', '');
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken,
    });
    return newToken;
  };
};

export function updateModsManifests(modManifest) {
  return (dispatch, getState) => {
    const { app: { modsManifests } } = getState();
    if (!modsManifests.find(v => v.projectID === modManifest.projectID)) {
      dispatch({
        type: ActionTypes.UPDATE_MODS_MANIFESTS,
        id: modManifest.projectID,
        modManifest
      });
    }
  };
}

export function removeModsManifests(id) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_MOD_MANIFEST,
      id,
    });
  };
}

