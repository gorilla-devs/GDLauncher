// import path from 'path';
// import { promises as fs } from 'fs';
// import PromiseQueue from '../../../common/utils/PromiseQueue';
// import mainWindow from './mainWindow';
// import eventTypes from './listeners/eventTypes';

// export const instances = {};

// export const listener = instancesPath => {
//   return async (dispatch, getState) => {
//     // Real Time Scanner
//     const Queue = new PromiseQueue();

//     Queue.on('start', queueLength => {
//       if (queueLength > 1) {
//         dispatch(
//           updateMessage({
//             content: `Syncronizing mods. ${queueLength} left.`,
//             duration: 0
//           })
//         );
//         mainWindow.webContents.send(eventTypes.UPDATE_MOD_SYNC, events);
//       }
//     });

//     Queue.on('executed', queueLength => {
//       if (queueLength > 1) {
//         dispatch(
//           updateMessage({
//             content: `Syncronizing mods. ${queueLength} left.`,
//             duration: 0
//           })
//         );
//       }
//     });

//     Queue.on('end', () => {
//       dispatch(updateMessage(null));
//     });

//     const changesTracker = {};

//     const processAddedFile = async (fileName, instanceName) => {
//       const processChange = async () => {
//         const newState = getState();
//         const instance = _getInstance(newState)(instanceName);
//         const isInConfig = (instance?.mods || []).find(
//           mod => mod.fileName === path.basename(fileName)
//         );
//         try {
//           const stat = await fs.lstat(fileName);

//           if (instance?.mods && !isInConfig && stat.isFile() && instance) {
//             // get murmur hash
//             const murmurHash = await getFileMurmurHash2(fileName);
//             const { data } = await getAddonsByFingerprint([murmurHash]);
//             const exactMatch = (data.exactMatches || [])[0];
//             const notMatch = (data.unmatchedFingerprints || [])[0];
//             let mod = {};
//             if (exactMatch) {
//               let addon = null;
//               try {
//                 addon = (await getAddon(exactMatch.file.projectId)).data;
//                 mod = normalizeModData(
//                   exactMatch.file,
//                   exactMatch.file.projectId,
//                   addon.name
//                 );
//                 mod.fileName = path.basename(fileName);
//               } catch {
//                 mod = {
//                   fileName: path.basename(fileName),
//                   displayName: path.basename(fileName),
//                   packageFingerprint: murmurHash
//                 };
//               }
//             } else if (notMatch) {
//               mod = {
//                 fileName: path.basename(fileName),
//                 displayName: path.basename(fileName),
//                 packageFingerprint: murmurHash
//               };
//             }
//             const updatedInstance = _getInstance(getState())(instanceName);
//             const isStillNotInConfig = !(updatedInstance?.mods || []).find(
//               m => m.fileName === path.basename(fileName)
//             );
//             if (isStillNotInConfig && updatedInstance) {
//               console.log('[RTS] ADDING MOD', fileName, instanceName);
//               await dispatch(
//                 updateInstanceConfig(instanceName, prev => ({
//                   ...prev,
//                   mods: [...(prev.mods || []), mod]
//                 }))
//               );
//             }
//           }
//         } catch (err) {
//           console.error(err);
//         }
//       };
//       Queue.add(processChange);
//     };

//     const processRemovedFile = async (fileName, instanceName) => {
//       const processChange = async () => {
//         const instance = getState().instances.list[instanceName];
//         const isInConfig = (instance?.mods || []).find(
//           mod => mod.fileName === path.basename(fileName)
//         );
//         if (isInConfig) {
//           try {
//             console.log('[RTS] REMOVING MOD', fileName, instanceName);
//             await dispatch(
//               updateInstanceConfig(instanceName, prev => ({
//                 ...prev,
//                 mods: (prev.mods || []).filter(
//                   m => m.fileName !== path.basename(fileName)
//                 )
//               }))
//             );
//           } catch (err) {
//             console.error(err);
//           }
//         }
//       };
//       Queue.add(processChange);
//     };

//     const processRenamedFile = async (
//       fileName,
//       oldInstanceName,
//       newFilePath
//     ) => {
//       const processChange = async () => {
//         const newState = getState();
//         const instances = newState.instances.list;
//         const modData = instances[oldInstanceName].mods.find(
//           m => m.fileName === path.basename(fileName)
//         );
//         if (modData) {
//           try {
//             console.log('[RTS] RENAMING MOD', fileName, newFilePath, modData);
//             await dispatch(
//               updateInstanceConfig(oldInstanceName, prev => ({
//                 ...prev,
//                 mods: [
//                   ...(prev.mods || []).filter(
//                     m => m.fileName !== path.basename(fileName)
//                   ),
//                   { ...modData, fileName: path.basename(newFilePath) }
//                 ]
//               }))
//             );
//           } catch (err) {
//             console.error(err);
//           }
//         }
//       };
//       Queue.add(processChange);
//     };

//     const processAddedInstance = async instanceName => {
//       const processChange = async () => {
//         const newState = getState();
//         const instance = _getInstance(newState)(instanceName);
//         if (!instance) {
//           const configPath = path.join(
//             instancesPath,
//             instanceName,
//             'config.json'
//           );
//           try {
//             const file = await fs.readFile(configPath, { encoding: 'utf-8' });
//             const config = JSON.parse(stripBom(file));

//             if (!config.modloader) {
//               throw new Error(`Config for ${instanceName} could not be parsed`);
//             }
//             console.log('[RTS] ADDING INSTANCE', instanceName);
//             dispatch({
//               type: ActionTypes.UPDATE_INSTANCES,
//               instances: {
//                 ...newState.instances.list,
//                 [instanceName]: { ...config, name: instanceName }
//               }
//             });
//           } catch (err) {
//             console.warn(err);
//           }
//         }
//       };
//       Queue.add(processChange);
//     };

//     const processRemovedInstance = instanceName => {
//       const processChange = async () => {
//         const newState = getState();
//         if (_getInstance(newState)(instanceName)) {
//           console.log('[RTS] REMOVING INSTANCE', instanceName);
//           dispatch({
//             type: ActionTypes.UPDATE_INSTANCES,
//             instances: omit(newState.instances.list, [instanceName])
//           });
//         }
//       };
//       Queue.add(processChange);
//     };

//     const processRenamedInstance = async (oldInstanceName, newInstanceName) => {
//       const processChange = async () => {
//         const newState = getState();
//         const instance = _getInstance(newState)(newInstanceName);

//         if (!instance) {
//           try {
//             const configPath = path.join(
//               instancesPath,
//               newInstanceName,
//               'config.json'
//             );
//             const file = await fs.readFile(configPath, { encoding: 'utf-8' });
//             const config = JSON.parse(stripBom(file));

//             if (!config.modloader) {
//               throw new Error(
//                 `Config for ${newInstanceName} could not be parsed`
//               );
//             }
//             console.log(
//               `[RTS] RENAMING INSTANCE ${oldInstanceName} -> ${newInstanceName}`
//             );
//             dispatch({
//               type: ActionTypes.UPDATE_INSTANCES,
//               instances: {
//                 ...omit(newState.instances.list, [oldInstanceName]),
//                 [newInstanceName]: { ...config, name: newInstanceName }
//               }
//             });

//             const instanceManagerModalIndex = newState.modals.findIndex(
//               x =>
//                 x.modalType === 'InstanceManager' &&
//                 x.modalProps.instanceName === oldInstanceName
//             );

//             dispatch({
//               type: UPDATE_MODAL,
//               modals: [
//                 ...newState.modals.slice(0, instanceManagerModalIndex),
//                 {
//                   modalType: 'InstanceManager',
//                   modalProps: { instanceName: newInstanceName }
//                 },
//                 ...newState.modals.slice(instanceManagerModalIndex + 1)
//               ]
//             });
//           } catch (err) {
//             console.error(err);
//           }
//         }
//       };
//       Queue.add(processChange);
//     };

//     ipcRenderer.on('listener-events', async (e, events) => {
//       await Promise.all(
//         events.map(async event => {
//           // Using oldFile instead of newFile is intentional.
//           // This is used to discard the ADD action dispatched alongside
//           // the rename action.
//           const completePath = path.join(
//             event.directory,
//             event.file || event.oldFile
//           );

//           const isRename = event.newFile && event.oldFile;

//           if (
//             (!isMod(completePath, instancesPath) &&
//               !isInstanceFolderPath(completePath, instancesPath) &&
//               !isRename) ||
//             // When renaming, an ADD action is dispatched too. Try to discard that
//             (event.action !== 2 && changesTracker[completePath]) ||
//             // Ignore java legacy fixer
//             path.basename(completePath) === '__JLF__.jar'
//           ) {
//             return;
//           }
//           if (event.action !== 2 && !changesTracker[completePath]) {
//             // If we cannot find it in the hash table, it's a new event
//             changesTracker[completePath] = {
//               action: event.action,
//               completed:
//                 event.action !== 0 ||
//                 (event.action === 0 &&
//                   isInstanceFolderPath(completePath, instancesPath)),
//               ...(event.action === 3 && {
//                 newFilePath: path.join(event.newDirectory, event.newFile)
//               })
//             };
//           }

//           if (
//             changesTracker[completePath] &&
//             !changesTracker[completePath].completed &&
//             (event.action === 2 || event.action === 0 || event.action === 1)
//           ) {
//             try {
//               await new Promise(resolve => setTimeout(resolve, 300));
//               await fs.open(completePath, 'r+');
//               changesTracker[completePath].completed = true;
//             } catch {
//               // Do nothing, simply not completed..
//             }
//           }
//         })
//       );

//       // Handle edge case where MOD-REMOVE is called before INSTANCE-REMOVE
//       Object.entries(changesTracker).forEach(
//         async ([fileName, { action, completed }]) => {
//           if (
//             isInstanceFolderPath(fileName, instancesPath) &&
//             action === 1 &&
//             completed
//           ) {
//             const instanceName = convertCompletePathToInstance(
//               fileName,
//               instancesPath
//             )
//               .substr(1)
//               .split(path.sep)[0];
//             // Check if we can find any other action with this instance name
//             Object.entries(changesTracker).forEach(
//               ([file, { action: act }]) => {
//                 if (isMod(file, instancesPath) && act === 1) {
//                   const instName = convertCompletePathToInstance(
//                     file,
//                     instancesPath
//                   )
//                     .substr(1)
//                     .split(path.sep)[0];
//                   if (instanceName === instName) {
//                     delete changesTracker[file];
//                   }
//                 }
//               }
//             );
//           }
//         }
//       );

//       Object.entries(changesTracker).map(
//         async ([fileName, { action, completed, newFilePath }]) => {
//           const filePath = newFilePath || fileName;
//           // Events are dispatched 3 times. Wait for 3 dispatches to be sure
//           // that the action was completely executed
//           if (completed) {
//             // Remove the current file from the tracker.
//             // Using fileName instead of filePath is intentional for the RENAME/ADD issue
//             delete changesTracker[fileName];

//             // Infer the instance name from the full path
//             const instanceName = convertCompletePathToInstance(
//               filePath,
//               instancesPath
//             )
//               .substr(1)
//               .split(path.sep)[0];

//             // If we're installing a modpack we don't want to process anything
//             const isLocked = await new Promise((resolve, reject) => {
//               lockfile.check(
//                 path.join(instancesPath, instanceName, 'installing.lock'),
//                 (err, locked) => {
//                   if (err) reject(err);
//                   resolve(locked);
//                 }
//               );
//             });
//             if (isLocked) return;

//             if (
//               isMod(fileName, instancesPath) &&
//               _getInstance(getState())(instanceName) &&
//               action !== 3
//             ) {
//               if (action === 0) {
//                 processAddedFile(filePath, instanceName);
//               } else if (action === 1) {
//                 processRemovedFile(filePath, instanceName);
//               }
//             } else if (
//               action === 3 &&
//               !isInstanceFolderPath(fileName, instancesPath) &&
//               !isInstanceFolderPath(newFilePath, instancesPath)
//             ) {
//               // Infer the instance name from the full path
//               const oldInstanceName = convertCompletePathToInstance(
//                 fileName,
//                 instancesPath
//               )
//                 .substr(1)
//                 .split(path.sep)[0];
//               if (
//                 oldInstanceName === instanceName &&
//                 isMod(newFilePath, instancesPath) &&
//                 isMod(fileName, instancesPath)
//               ) {
//                 processRenamedFile(fileName, instanceName, newFilePath);
//               } else if (
//                 oldInstanceName !== instanceName &&
//                 isMod(newFilePath, instancesPath) &&
//                 isMod(fileName, instancesPath)
//               ) {
//                 processRemovedFile(fileName, oldInstanceName);
//                 processAddedFile(newFilePath, instanceName);
//               } else if (
//                 !isMod(newFilePath, instancesPath) &&
//                 isMod(fileName, instancesPath)
//               ) {
//                 processRemovedFile(fileName, oldInstanceName);
//               } else if (
//                 isMod(newFilePath, instancesPath) &&
//                 !isMod(fileName, instancesPath)
//               ) {
//                 processAddedFile(newFilePath, instanceName);
//               }
//             } else if (isInstanceFolderPath(filePath, instancesPath)) {
//               if (action === 0) {
//                 processAddedInstance(instanceName);
//               } else if (action === 1) {
//                 processRemovedInstance(instanceName);
//               } else if (action === 3) {
//                 const oldInstanceName = convertCompletePathToInstance(
//                   fileName,
//                   instancesPath
//                 )
//                   .substr(1)
//                   .split(path.sep)[0];
//                 processRenamedInstance(oldInstanceName, instanceName);
//               }
//             }
//           }
//         }
//       );
//     });
//     await ipcRenderer.invoke('start-listener', instancesPath);
//   };
// };
