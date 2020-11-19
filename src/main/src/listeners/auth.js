import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import {
  getAllAccounts,
  isNewUser,
  loginThroughNativePlatforms,
  loginWithUsernamePassword,
  logout,
  validateCurrentAccount
} from '../auth';

addListener(EV.AUTH.LOGIN_WITH_USERNAME_PASSWORD, loginWithUsernamePassword);
addListener(EV.AUTH.VALIDATE_CURRENT_ACCOUNT, validateCurrentAccount);
addListener(EV.AUTH.LOGIN_THROUGH_NATIVE_PLATFORM, loginThroughNativePlatforms);
addListener(EV.AUTH.GET_ALL_ACCOUNTS, getAllAccounts);
addListener(EV.AUTH.IS_NEW_USER, isNewUser);
addListener(EV.AUTH.LOGOUT, logout);
