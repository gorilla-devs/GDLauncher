import path from 'path';
import log from 'electron-log';
import { add as add7z } from 'node-7z';
import LevelUp from 'levelup';
import LevelDOWN from 'leveldown';
import encode from 'encoding-down';
import EV from '../../../common/messageEvents';
import generateMessageId from '../../../common/utils/generateMessageId';
import PromiseQueue from '../../../common/utils/PromiseQueue';
import { sendMessage } from '../messageListener';
import { get7zPath } from '../helpers';
import { INSTANCES_PATH } from '../config';

// eslint-disable-next-line
export const INSTANCES = {};
export const INSTANCES_QUEUES = {};

export const INSTANCES_INSTALL_QUEUE = new PromiseQueue();

const INSTANCES_DBS = {};
export const getInstanceDB = uid => {
  if (INSTANCES_DBS[uid] && INSTANCES_DBS[uid].isOpen()) {
    return INSTANCES_DBS[uid];
  }
  const dbPath = path.join(INSTANCES_PATH, uid, '__db_config');
  const instanceDB = LevelUp(
    encode(LevelDOWN(dbPath), { valueEncoding: 'json' })
  );

  const closeDB = () => {
    if (instanceDB.isOpen()) {
      instanceDB.removeAllListeners();
      instanceDB.close();
    }
  };

  let autoCloseDB = setTimeout(closeDB, 1000 * 40);
  instanceDB.on('put', () => {
    clearTimeout(autoCloseDB);
    autoCloseDB = setTimeout(closeDB, 1000 * 40);
  });
  instanceDB.on('del', () => {
    clearTimeout(autoCloseDB);
    autoCloseDB = setTimeout(closeDB, 1000 * 40);
  });
  INSTANCES_DBS[uid] = instanceDB;
  return instanceDB;
};

export const updateInstance = uid => {
  const updateConfigFile = async () => {
    try {
      await getInstanceDB(uid).put(`instances.${uid}.config`, INSTANCES[uid]);
      sendMessage(
        EV.UPDATE_SPECIFIC_INSTANCE,
        generateMessageId(),
        INSTANCES[uid]
      );
    } catch (e) {
      log.error(`Could not update ${uid} config`, e);
    }
  };

  if (!INSTANCES_QUEUES[uid]) {
    INSTANCES_QUEUES[uid] = new PromiseQueue();
  }

  return INSTANCES_QUEUES[uid].add(updateConfigFile);
};

export const renameInstance = async ([uid, newName]) => {
  INSTANCES[uid].name = newName;
  updateInstance(uid);
};

export const createExtractZip = async ([
  archiveName,
  zipDestPath,
  filesArray
]) => {
  const zipCreation = add7z(`${archiveName}.zip`, filesArray, {
    $bin: get7zPath(),
    $raw: ['-tzip'],
    $spawnOptions: { cwd: zipDestPath }
  });
  await new Promise((resolve, reject) => {
    zipCreation.on('end', () => {
      resolve();
    });
    zipCreation.on('error', err => {
      reject(err.stderr);
    });
  });
};
