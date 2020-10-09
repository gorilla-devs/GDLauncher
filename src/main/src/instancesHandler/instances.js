import { app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import log from 'electron-log';
import EV from '../../../common/messageEvents';
import generateMessageId from '../../../common/utils/generateMessageId';
import PromiseQueue from '../../../common/utils/PromiseQueue';
import { sendMessage } from '../messageListener';

// eslint-disable-next-line
export const INSTANCES = {};
export const INSTANCES_QUEUES = {};

export const INSTANCES_INSTALL_QUEUE = new PromiseQueue();

export const updateInstance = instanceName => {
  const instancesPath = path.join(app.getPath('userData'), 'instances');
  const updateConfigFile = async () => {
    const configPath = path.join(instancesPath, instanceName, 'config.json');
    const tempConfigPath = path.join(
      instancesPath,
      instanceName,
      'config_new_temp.json'
    );
    // Ensure that the new config is actually valid to write
    try {
      const JsonString = JSON.stringify(INSTANCES[instanceName]);
      const isJson = JSON.parse(JsonString);
      if (!isJson || typeof isJson !== 'object') {
        const err = `Cannot write this JSON to ${instanceName}. Not an object`;
        log.error(err);
        throw new Error(err);
      }
    } catch {
      const err = `Cannot write this JSON to ${instanceName}. Not parsable`;
      log.error(err, INSTANCES[instanceName]);
      throw new Error(err);
    }

    try {
      sendMessage(
        EV.UPDATE_SPECIFIC_INSTANCE,
        generateMessageId(),
        INSTANCES[instanceName]
      );
      await fs.writeFile(
        tempConfigPath,
        JSON.stringify(INSTANCES[instanceName])
      );
      await fs.rename(tempConfigPath, configPath);
    } catch (err) {
      log.error('Could not perform write action to config', err, instanceName);
    }
  };

  if (!INSTANCES_QUEUES[instanceName]) {
    INSTANCES_QUEUES[instanceName] = new PromiseQueue();
  }

  INSTANCES_QUEUES[instanceName].add(updateConfigFile);
};

export const renameInstance = async ([oldName, newName]) => {
  const instancesPath = path.join(app.getPath('userData'), 'instances');
  return fs.rename(
    path.join(instancesPath, oldName),
    path.join(instancesPath, newName)
  );
};
