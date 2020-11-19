import log from 'electron-log';
import path from 'path';
import { promises as fs } from 'fs';
import { APPDATA_PATH, DB_INSTANCE } from './config';
import {
  mcAuthenticate,
  mcInvalidate,
  mcRefresh,
  mcValidate
} from '../../common/api';
import getClientToken from './helpers/getClientToken';
import ERRORS from '../../common/errors';
import { getPlayerSkin } from './helpers';

export const validateCurrentAccount = async () => {
  const accounts = await DB_INSTANCE.get('accounts').catch();
  const currentAccountId = await DB_INSTANCE.get('currentAccountId');
  const currentAccount = accounts[currentAccountId];
  const { accessToken, clientToken, selectedProfile } = currentAccount;
  if (!accessToken) throw new Error(ERRORS.LOGIN.ACCESS_TOKEN_MISSING);
  try {
    await mcValidate(accessToken, clientToken);
    try {
      const skinUrl = await getPlayerSkin(selectedProfile.id);
      if (skinUrl) {
        currentAccount.skin = skinUrl;
      }
    } catch (err) {
      log.warn('Could not fetch skin', err);
    }
    await DB_INSTANCE.put('accounts', accounts);
    return currentAccount;
  } catch (error) {
    log.error(error);
    // Trying refreshing the stored access token
    if (error.response && error.response.status === 403) {
      try {
        const { data } = await mcRefresh(accessToken, clientToken);
        const skinUrl = await getPlayerSkin(data.selectedProfile.id);
        if (skinUrl) {
          data.skin = skinUrl;
        }
        await DB_INSTANCE.put('currentAccountId', data.selectedProfile.id);
        accounts[data.selectedProfile.id] = data;
        await DB_INSTANCE.put('accounts', accounts);
        return data;
      } catch (nestedError) {
        log.error(error, nestedError);
        throw new Error(error, nestedError);
      }
    } else if (error.message === 'Network Error') {
      return currentAccount;
    }
  }
};

export const switchToFirstValidAccount = async () => {
  const accounts = await DB_INSTANCE.get('accounts').catch();
  let found = null;
  for (const accountId in accounts) {
    try {
      await DB_INSTANCE.put(
        'currentAccountId',
        accounts[accountId].selectedProfile.id
      );
      // eslint-disable-next-line no-await-in-loop
      await validateCurrentAccount();
      found = accounts[accountId].selectedProfile.id;
    } catch {
      log.error(`Failed to validate ${accounts[accountId].selectedProfile.id}`);
    }
  }
  if (!found) {
    await DB_INSTANCE.put('currentAccountId', null);
  }
  return found;
};

export const removeAccount = async id => {
  const currentAccountId = await DB_INSTANCE.get('currentAccountId');
  let newId = id;
  if (currentAccountId === id) {
    newId = await switchToFirstValidAccount();
  }
  return newId;
};

export const loginWithUsernamePassword = async ([username, password]) => {
  if (!username || !password) {
    throw new Error(ERRORS.LOGIN.EMPTY_USERNAME_OR_PASSWORD);
  }

  try {
    let data = null;
    try {
      ({ data } = await mcAuthenticate(
        username,
        password,
        await getClientToken()
      ));
    } catch (err) {
      log.error(err);
      throw new Error(ERRORS.LOGIN.WRONG_USERNAME_OR_PASSWORD);
    }

    if (!data?.selectedProfile?.id) {
      throw new Error(ERRORS.LOGIN.DID_NOT_BUY_THE_GAME);
    }
    const skinUrl = await getPlayerSkin(data.selectedProfile.id);
    if (skinUrl) {
      data.skin = skinUrl;
    }

    await DB_INSTANCE.put('currentAccountId', data.selectedProfile.id);
    // Update or add the account in the accounts list
    const accounts = (await DB_INSTANCE.get('accounts').catch()) || {};
    accounts[data.selectedProfile.id] = data;
    await DB_INSTANCE.put('accounts', accounts);
    return data;
  } catch (err) {
    log.error(err);
    throw new Error(err);
  }
};

export const logout = async () => {
  const accounts = await DB_INSTANCE.get('accounts').catch();
  const currentAccountId = await DB_INSTANCE.get('currentAccountId');
  const { clientToken, accessToken } = accounts[currentAccountId];
  mcInvalidate(accessToken, clientToken).catch(log.error);
  delete accounts[currentAccountId];
  await DB_INSTANCE.put('accounts', accounts);
  const newCurrentId = await removeAccount(currentAccountId);
  return newCurrentId;
};

export const loginThroughNativePlatforms = async () => {
  const mcFolder = process.platform === 'darwin' ? 'minecraft' : '.minecraft';
  const vanillaMCPath =
    process.platform === 'linux'
      ? path.resolve(APPDATA_PATH, '../', mcFolder)
      : path.join(APPDATA_PATH, mcFolder);
  const vnlJson = JSON.parse(
    await fs.readFile(path.join(vanillaMCPath, 'launcher_profiles.json'))
  );

  try {
    const { clientToken } = vnlJson;
    const { account } = vnlJson.selectedUser;
    const { accessToken } = vnlJson.authenticationDatabase[account];

    const { data } = await mcRefresh(accessToken, clientToken);
    const skinUrl = await getPlayerSkin(data.selectedProfile.id);
    if (skinUrl) {
      data.skin = skinUrl;
    }

    // We need to update the accessToken in launcher_profiles.json
    vnlJson.authenticationDatabase[account].accessToken = data.accessToken;
    await fs.writeFile(
      path.join(vanillaMCPath, 'launcher_profiles.json'),
      JSON.stringify(vnlJson)
    );

    await DB_INSTANCE.put('currentAccountId', data.selectedProfile.id);
    // Update or add the account in the accounts list
    const accounts = (await DB_INSTANCE.get('accounts').catch()) || {};
    accounts[data.selectedProfile.id] = data;
    await DB_INSTANCE.put('accounts', accounts);
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllAccounts = async () => {
  return DB_INSTANCE.get('accounts');
};

export const isNewUser = async () => {
  try {
    await DB_INSTANCE.get('onboarded');
    return false;
  } catch {
    return true;
  }
};
