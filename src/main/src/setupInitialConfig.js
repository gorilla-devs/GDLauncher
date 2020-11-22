import { DB_INSTANCE, DB_SCHEMA } from './config';

const setupInitialConfig = async () => {
  const initialValues = {
    [DB_SCHEMA.showNews]: true,
    [DB_SCHEMA.concurrentDownloads]: 5
  };

  for (const key in initialValues) {
    try {
      // Check if the value is undefined
      await DB_INSTANCE.get(key);
    } catch {
      // If it fails it means that it's not set, hence we set it
      await DB_INSTANCE.put(key, initialValues[key]);
    }
  }
};

export default setupInitialConfig;
