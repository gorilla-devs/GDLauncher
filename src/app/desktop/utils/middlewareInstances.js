import watch from "node-watch";
import makeDir from "make-dir";
import path from "path";
import { debounce } from "lodash";
import * as ActionTypes from "../../../common/reducers/actionTypes";
import getInstances from "./getInstances";
import checkModsSync from "./checkModsSync";

let listener;

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;
  if (!nextState.settings.dataPath) return;
  const instancesPath = path.join(nextState.settings.dataPath, "instances");

  const startListener = () => {
    const updateInstances = debounce(
      instances => {
        // if (checkMods) {
        //   checkModsSync(instancesPath);
        // }
        dispatch({
          type: ActionTypes.UPDATE_INSTANCES,
          instances
        });
      },
      1000,
      { maxWait: 2500 }
    );
    return watch(
      instancesPath,
      {
        recursive: true,
        filter: f => true || /(config\.json)|(mods)/.test(f)
      },
      (e, file) => {
        if (file.includes("config.json")) return;
        getInstances(instancesPath)
          .then(instances => {
            const checkMods = file.includes("mods");
            updateInstances(instances, checkMods);
            return instances;
          })
          .catch(console.error);
      }
    );
  };

  const dataPathChanged =
    currState.settings.dataPath !== nextState.settings.dataPath;

  // If not initialized yet, start listener and do a first-time read
  if (!nextState.instances.started) {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_STARTED,
      started: true
    });
    getInstances(instancesPath)
      .then(instances => {
        dispatch({
          type: ActionTypes.UPDATE_INSTANCES,
          instances
        });
        return instances;
      })
      .then(() => {
        checkModsSync(instancesPath);
        listener = startListener();
        listener.on("error", async () => {
          // Check if the folder exists and create it if it doesn't
          await makeDir(instancesPath);
          if (!listener.isClosed()) {
            listener.close();
          }
          startListener();
        });
        return null;
      })
      .catch(console.error);
  } else if (dataPathChanged) {
    // If the path changed, close the previous listener and start a new one
    if (listener && !listener.isClosed()) {
      listener.close();
    }
    getInstances(instancesPath)
      .then(instances => {
        dispatch({
          type: ActionTypes.UPDATE_INSTANCES,
          instances
        });
        startListener();
        return instances;
      })
      .catch(console.error);
  }

  return result;
};

export default middleware;
