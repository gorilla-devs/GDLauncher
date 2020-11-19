import EV from 'src/common/messageEvents';
import sendMessage from './helpers/sendMessage';

export const loginMinecraftAccount = (username, password) => {
  return async () => {
    const result = await sendMessage(EV.AUTH.LOGIN_WITH_USERNAME_PASSWORD, [
      username,
      password
    ]);
    console.log(result);
  };
};

export const checkAuthAccessToken = () => {
  return async () => {
    const result = await sendMessage(EV.AUTH.LOGIN_WITH_USERNAME_PASSWORD);
    console.log(result);
  };
};
