import { promises as fs } from 'fs';
import { debounce } from 'lodash';
import path from 'path';
import log from 'electron-log';
import lockfile from 'lockfile';
import nsfw from 'nsfw';
import murmur from 'murmur2-calculator';
import { getAddon, getAddonsByFingerprint } from '../../../common/api';
import EV from '../../../common/messageEvents';
import {
  convertCompletePathToInstance,
  isInstanceFolderPath,
  isMod,
  normalizeModData
} from '../../../common/utils';
import generateMessageId from '../../../common/utils/generateMessageId';
import PromiseQueue from '../../../common/utils/PromiseQueue';
import { sendMessage } from '../messageListener';
import { INSTANCES, updateInstance } from './instances';

const getFileMurmurHash2 = filePath => {
  return new Promise((resolve, reject) => {
    return murmur(filePath).then(v => {
      if (v.toString().length === 0) reject();
      return resolve(v);
    });
  });
};

const startListener = async instancesPath => {
  // Real Time Scanner
  const Queue = new PromiseQueue();

  const unsafeUpdateModSyncState = v => {
    sendMessage(EV.UPDATE_MOD_SYNC_STATE, generateMessageId(), v);
  };
  const updateModSyncState = debounce(unsafeUpdateModSyncState, 200, {
    trailing: true,
    maxWait: 600
  });

  Queue.on('start', queueLength => {
    if (queueLength > 1) {
      updateModSyncState(queueLength);
    }
  });

  Queue.on('executed', queueLength => {
    if (queueLength > 1) {
      updateModSyncState(queueLength);
    }
  });

  Queue.on('end', () => {
    updateModSyncState(null);
  });

  const changesTracker = {};

  const processAddedFile = async (fileName, instanceName) => {
    const processChange = async () => {
      const instance = INSTANCES[instanceName];
      const isInConfig = (instance?.mods || []).find(
        mod => mod.fileName === path.basename(fileName)
      );
      try {
        const stat = await fs.lstat(fileName);

        if (instance?.mods && !isInConfig && stat.isFile() && instance) {
          // get murmur hash
          const murmurHash = await getFileMurmurHash2(fileName);
          const { data } = await getAddonsByFingerprint([murmurHash]);
          const exactMatch = (data.exactMatches || [])[0];
          const notMatch = (data.unmatchedFingerprints || [])[0];
          let mod = {};
          if (exactMatch) {
            let addon = null;
            try {
              addon = (await getAddon(exactMatch.file.projectId)).data;
              mod = normalizeModData(
                exactMatch.file,
                exactMatch.file.projectId,
                addon.name
              );
              mod.fileName = path.basename(fileName);
            } catch {
              mod = {
                fileName: path.basename(fileName),
                displayName: path.basename(fileName),
                packageFingerprint: murmurHash
              };
            }
          } else if (notMatch) {
            mod = {
              fileName: path.basename(fileName),
              displayName: path.basename(fileName),
              packageFingerprint: murmurHash
            };
          }
          const updatedInstance = INSTANCES[instanceName];
          const isStillNotInConfig = !(updatedInstance?.mods || []).find(
            m => m.fileName === path.basename(fileName)
          );
          if (isStillNotInConfig && updatedInstance) {
            console.log('[RTS] ADDING MOD', fileName, instanceName);

            INSTANCES[instanceName].mods.push(mod);
            updateInstance(instanceName);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    Queue.add(processChange);
  };

  const processRemovedFile = async (fileName, instanceName) => {
    const processChange = async () => {
      const instance = INSTANCES[instanceName];
      const isInConfig = (instance?.mods || []).find(
        mod => mod.fileName === path.basename(fileName)
      );
      if (isInConfig) {
        try {
          console.log('[RTS] REMOVING MOD', fileName, instanceName);
          INSTANCES[instanceName].mods = INSTANCES[instanceName].mods.filter(
            m => m.fileName !== path.basename(fileName)
          );
          // TODO: not updating ui
          updateInstance(instanceName);
        } catch (err) {
          console.error(err);
        }
      }
    };
    Queue.add(processChange);
  };

  const processRenamedFile = async (fileName, instanceName, newFilePath) => {
    const processChange = async () => {
      const modData = INSTANCES[instanceName].mods.find(
        m => m.fileName === path.basename(fileName)
      );
      if (modData) {
        try {
          console.log('[RTS] RENAMING MOD', fileName, newFilePath);
          INSTANCES[instanceName].mods = [
            ...(INSTANCES[instanceName].mods || []).filter(
              m => m.fileName !== path.basename(fileName)
            ),
            { ...modData, fileName: path.basename(newFilePath) }
          ];

          updateInstance(instanceName);
        } catch (err) {
          console.error(err);
        }
      }
    };
    Queue.add(processChange);
  };

  const processAddedInstance = async instanceName => {
    const processChange = async () => {
      const instance = INSTANCES[instanceName];
      if (!instance) {
        const configPath = path.join(
          instancesPath,
          instanceName,
          'config.json'
        );
        try {
          const config = JSON.parse(await fs.readFile(configPath));

          if (!config.modloader) {
            throw new Error(`Config for ${instanceName} could not be parsed`);
          }
          console.log('[RTS] ADDING INSTANCE', instanceName);

          // ADD INSTANCE AND UPDATE
          INSTANCES[instanceName] = { ...config, name: instanceName };
          updateInstance(instanceName);
        } catch (err) {
          console.warn(err);
        }
      }
    };
    Queue.add(processChange);
  };

  const processRemovedInstance = instanceName => {
    const processChange = async () => {
      if (INSTANCES[instanceName]) {
        console.log('[RTS] REMOVING INSTANCE', instanceName);
        delete INSTANCES[instanceName];
        sendMessage(
          EV.REMOVE_SPECIFIC_INSTANCE,
          generateMessageId(),
          instanceName
        );
      }
    };
    Queue.add(processChange);
  };

  const processRenamedInstance = async (oldInstanceName, newInstanceName) => {
    const processChange = async () => {
      const instance = INSTANCES[newInstanceName];

      if (!instance) {
        try {
          const configPath = path.join(
            instancesPath,
            newInstanceName,
            'config.json'
          );
          const config = JSON.parse(await fs.readFile(configPath));
          if (!config.modloader) {
            throw new Error(
              `Config for ${newInstanceName} could not be parsed`
            );
          }
          console.log(
            `[RTS] RENAMING INSTANCE ${oldInstanceName} -> ${newInstanceName}`
          );
          INSTANCES[newInstanceName] = {
            ...config,
            name: newInstanceName
          };
          delete INSTANCES[oldInstanceName];
          await sendMessage(
            EV.UPDATE_INSTANCES,
            generateMessageId(),
            INSTANCES
          );
          await sendMessage(
            EV.UPDATE_MANAGE_MODAL_INSTANCE_RENAME,
            generateMessageId(),
            [oldInstanceName, newInstanceName]
          );
        } catch (err) {
          console.error(err);
        }
      }
    };
    Queue.add(processChange);
  };

  const watcher = await nsfw(instancesPath, async events => {
    console.log(`Detected ${events.length} events from instances listener`);
    await Promise.all(
      events.map(async event => {
        // Using oldFile instead of newFile is intentional.
        // This is used to discard the ADD action dispatched alongside
        // the rename action.
        const completePath = path.join(
          event.directory,
          event.file || event.oldFile
        );

        const isRename = event.newFile && event.oldFile;

        if (
          (!isMod(completePath, instancesPath) &&
            !isInstanceFolderPath(completePath, instancesPath) &&
            !isRename) ||
          // When renaming, an ADD action is dispatched too. Try to discard that
          (event.action !== 2 && changesTracker[completePath]) ||
          // Ignore java legacy fixer
          path.basename(completePath) === '__JLF__.jar'
        ) {
          return;
        }
        if (event.action !== 2 && !changesTracker[completePath]) {
          // If we cannot find it in the hash table, it's a new event
          changesTracker[completePath] = {
            action: event.action,
            completed:
              event.action !== 0 ||
              (event.action === 0 &&
                isInstanceFolderPath(completePath, instancesPath)),
            ...(event.action === 3 && {
              newFilePath: path.join(event.newDirectory, event.newFile)
            })
          };
        }

        if (
          changesTracker[completePath] &&
          !changesTracker[completePath].completed &&
          (event.action === 2 || event.action === 0)
        ) {
          let fileHandle;
          try {
            fileHandle = await fs.open(completePath, 'r+');
            changesTracker[completePath].completed = true;
          } finally {
            // Do nothing, simply not completed..
            // Remember to close the file handler
            if (fileHandle !== undefined) {
              await fileHandle.close();
            }
          }
        }
      })
    );

    // Handle edge case where MOD-REMOVE is called before INSTANCE-REMOVE
    Object.entries(changesTracker).forEach(
      async ([fileName, { action, completed }]) => {
        if (
          isInstanceFolderPath(fileName, instancesPath) &&
          action === 1 &&
          completed
        ) {
          const instanceName = convertCompletePathToInstance(
            fileName,
            instancesPath
          )
            .substr(1)
            .split(path.sep)[0];
          // Check if we can find any other action with this instance name
          Object.entries(changesTracker).forEach(([file, { action: act }]) => {
            if (isMod(file, instancesPath) && act === 1) {
              const instName = convertCompletePathToInstance(
                file,
                instancesPath
              )
                .substr(1)
                .split(path.sep)[0];
              if (instanceName === instName) {
                delete changesTracker[file];
              }
            }
          });
        }
      }
    );

    Object.entries(changesTracker).map(
      async ([fileName, { action, completed, newFilePath }]) => {
        const filePath = newFilePath || fileName;
        // Events are dispatched 3 times. Wait for 3 dispatches to be sure
        // that the action was completely executed
        if (completed) {
          // Remove the current file from the tracker.
          // Using fileName instead of filePath is intentional for the RENAME/ADD issue
          delete changesTracker[fileName];

          // Infer the instance name from the full path
          const instanceName = convertCompletePathToInstance(
            filePath,
            instancesPath
          )
            .substr(1)
            .split(path.sep)[0];

          // If we're installing a modpack we don't want to process anything
          const isLocked = await new Promise((resolve, reject) => {
            lockfile.check(
              path.join(instancesPath, instanceName, 'installing.lock'),
              (err, locked) => {
                if (err) reject(err);
                resolve(locked);
              }
            );
          });

          if (isLocked) return;

          if (
            isMod(fileName, instancesPath) &&
            INSTANCES[instanceName] &&
            action !== 3
          ) {
            if (action === 0) {
              processAddedFile(filePath, instanceName);
            } else if (action === 1) {
              processRemovedFile(filePath, instanceName);
            }
          } else if (
            action === 3 &&
            !isInstanceFolderPath(fileName, instancesPath) &&
            !isInstanceFolderPath(newFilePath, instancesPath)
          ) {
            // Infer the instance name from the full path
            const oldInstanceName = convertCompletePathToInstance(
              fileName,
              instancesPath
            )
              .substr(1)
              .split(path.sep)[0];
            if (
              oldInstanceName === instanceName &&
              isMod(newFilePath, instancesPath) &&
              isMod(fileName, instancesPath)
            ) {
              processRenamedFile(fileName, instanceName, newFilePath);
            } else if (
              oldInstanceName !== instanceName &&
              isMod(newFilePath, instancesPath) &&
              isMod(fileName, instancesPath)
            ) {
              processRemovedFile(fileName, oldInstanceName);
              processAddedFile(newFilePath, instanceName);
            } else if (
              !isMod(newFilePath, instancesPath) &&
              isMod(fileName, instancesPath)
            ) {
              processRemovedFile(fileName, oldInstanceName);
            } else if (
              isMod(newFilePath, instancesPath) &&
              !isMod(fileName, instancesPath)
            ) {
              processAddedFile(newFilePath, instanceName);
            }
          } else if (isInstanceFolderPath(filePath, instancesPath)) {
            if (action === 0) {
              processAddedInstance(instanceName);
            } else if (action === 1) {
              processRemovedInstance(instanceName);
            } else if (action === 3) {
              const oldInstanceName = convertCompletePathToInstance(
                fileName,
                instancesPath
              )
                .substr(1)
                .split(path.sep)[0];
              processRenamedInstance(oldInstanceName, instanceName);
            }
          }
        }
      }
    );
  });
  log.log('Started listener');
  return watcher.start();
};

export default startListener;
