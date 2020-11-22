import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import {
  getAllAccounts,
  getCurrentAccountId,
  isNewUser,
  loginThroughNativePlatform,
  loginWithUsernamePassword,
  logout,
  validateCurrentAccount,
  setCurrentAccountId,
  switchToFirstValidAccount,
  setIsNewUser
} from '../auth';

addListener(EV.AUTH.LOGIN_WITH_USERNAME_PASSWORD, loginWithUsernamePassword);
addListener(EV.AUTH.VALIDATE_CURRENT_ACCOUNT, validateCurrentAccount);
addListener(EV.AUTH.LOGIN_THROUGH_NATIVE_PLATFORM, loginThroughNativePlatform);
addListener(EV.AUTH.GET_ALL_ACCOUNTS, getAllAccounts);
addListener(EV.AUTH.GET_CURRENT_ACCOUNT_ID, getCurrentAccountId);
addListener(EV.AUTH.SET_CURRENT_ACCOUNT_ID, setCurrentAccountId);
addListener(EV.AUTH.IS_NEW_USER, isNewUser);
addListener(EV.AUTH.SET_IS_NEW_USER, setIsNewUser);
addListener(EV.AUTH.SWITCH_TO_FIRST_VALID_ACCOUNT, switchToFirstValidAccount);
addListener(EV.AUTH.LOGOUT, logout);
