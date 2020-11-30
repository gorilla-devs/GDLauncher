import { persistedKeys } from 'src/common/persistedKeys';
import { DB_INSTANCE } from './config';

const setupInitialConfig = async () => {
  for (const value of persistedKeys) {
    try {
      // Check if the value is undefined
      await DB_INSTANCE.get(value.key);
    } catch {
      // If it fails it means that it's not set, hence we set it
      await DB_INSTANCE.update(value.key, value.default);
    }
  }
};

export default setupInitialConfig;
