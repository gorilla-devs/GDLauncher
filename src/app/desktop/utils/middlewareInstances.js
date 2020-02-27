import watch from "node-watch";
import makeDir from "make-dir";
import path from "path";
import { debounce } from "lodash";
import * as ActionTypes from "../../../common/reducers/actionTypes";
import getInstances from "./getInstances";

let listener;

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;
  if (!nextState.settings.dataPath) return result;
  const instancesPath = path.join(nextState.settings.dataPath, "instances");

  const startListener = () => {
    const updateInstances = debounce(
      instances => {
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
        filter: f =>
          true ||
          /(^(\/|\\)(?:[^/]*)$)|(mods)|(resoucepacks)|(screenshots)/.test(f)
      },
      (e, file) => {
        // const relativePath = file.replace(instancesPath, "");
        // console.log(relativePath);
        // getInstances(instancesPath)
        //   .then(instances => {
        //     const checkMods = file.includes("mods");
        //     updateInstances(instances, checkMods);
        //     return instances;
        //   })
        //   .catch(console.error);
      }
    );
  };

  const startInstancesListener = async () => {
    if (listener && !listener.isClosed()) {
      listener.close();
    }
    await makeDir(instancesPath);
    const instances = await getInstances(instancesPath);
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES,
      instances
    });
    listener = startListener();
    listener.on("error", async () => {
      // Check if the folder exists and create it if it doesn't
      if (!listener.isClosed()) {
        listener.close();
      }
      listener = startListener();
    });
  };

  const dataPathChanged =
    currState.settings.dataPath !== nextState.settings.dataPath;

  // If not initialized yet, start listener and do a first-time read
  if (!nextState.instances.started || dataPathChanged) {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_STARTED,
      started: true
    });
    startInstancesListener();
  }

  return result;
};

export default middleware;
