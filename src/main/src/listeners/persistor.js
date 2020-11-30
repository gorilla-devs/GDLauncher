import { persistedKeys } from 'src/common/persistedKeys';
import { addListener } from '../messageListener';
import { DB_INSTANCE } from '../config';

const setupListeners = () => {
  for (const value of persistedKeys) {
    addListener(value.get, async () => {
      return DB_INSTANCE.get(value.key);
    });
    addListener(value.set, async v => {
      return DB_INSTANCE.update(value.key, v);
    });
  }
};

setupListeners();
