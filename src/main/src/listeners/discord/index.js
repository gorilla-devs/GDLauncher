import { addListener } from '../../messageListener';
import EV from '../../../../common/messageEvents';
import { initRPC, shutdownRPC, updateDetails } from './discordRPC';

addListener(EV.INIT_DISCORD_RPC, async () => {
  return initRPC();
});

addListener(EV.UPDATE_DISCORD_RPC, async () => {
  return updateDetails();
});

addListener(EV.SHUTDOWN_DISCORD_RPC, async () => {
  return shutdownRPC();
});
