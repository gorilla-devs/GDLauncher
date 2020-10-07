import { app } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import { INSTANCES } from '../instancesHandler';

addListener(EV.GET_INSTANCES, async () => {
  return INSTANCES;
});

addListener(EV.UPDATE_INSTANCE_CONFIG_SET, async (instanceName, key, value) => {
  const instancePath = path.join(
    app.getPath('userData'),
    'instances',
    instanceName
  );
  const store = new Store({ cwd: instancePath, name: 'config' });
  store.set(key, value);
});

addListener(
  EV.UPDATE_INSTANCE_CONFIG_DELETE,
  async (instanceName, key, value) => {
    const instancePath = path.join(
      app.getPath('userData'),
      'instances',
      instanceName
    );
    const store = new Store({ cwd: instancePath, name: 'config' });
    store.delete(key, value);
  }
);

addListener(EV.UPDATE_MOD_SYNC_LONG, async () => {
  await new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
  return { c: 1 };
});
