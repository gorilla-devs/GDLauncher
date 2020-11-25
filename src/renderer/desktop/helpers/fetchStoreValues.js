import { persistedKeys } from 'src/common/persistedKeys';
import sendMessage from './sendMessage';

const fetchStoreValues = async () => {
  const promises = [];
  const response = {};
  for (const value of persistedKeys) {
    promises.push(
      new Promise((resolve, reject) => {
        sendMessage(value.get)
          .then(res => {
            console.log(value.key);
            response[value.key] = res;
            return resolve(res);
          })
          .catch(e => {
            console.error(e);
            response[value.key] = value.default;
            reject(e);
          });
      })
    );
  }

  await Promise.all(promises);
  console.log(response);
  return response;
};

export default fetchStoreValues;
