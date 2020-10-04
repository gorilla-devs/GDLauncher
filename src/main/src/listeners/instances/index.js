import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';

addListener(EV.UPDATE_MOD_SYNC, async () => {
  return true;
});

addListener(EV.UPDATE_MOD_SYNC_LONG, async () => {
  await new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
  return { c: 1 };
});
