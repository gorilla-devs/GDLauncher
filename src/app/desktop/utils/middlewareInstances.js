// import watch from "node-watch";
import makeDir from "make-dir";
import path from "path";
import { ipcRenderer } from "electron";
import * as ActionTypes from "../../../common/reducers/actionTypes";
import getInstances from "./getInstances";
import modsFingerprintsScan from "./modsFingerprintsScan";
import { startListener } from "../../../common/reducers/actions";

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;
  if (!nextState.settings.dataPath) return result;
  const instancesPath = path.join(nextState.settings.dataPath, "instances");

  const dataPathChanged =
    currState.settings.dataPath !== nextState.settings.dataPath;

  // If not initialized yet, start listener and do a first-time read
  if (!nextState.instances.started || dataPathChanged) {
    const startInstancesListener = async () => {
      await ipcRenderer.invoke("stop-listener");
      await makeDir(instancesPath);
      const instances = await getInstances(instancesPath);
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances
      });
      const instances1 = await modsFingerprintsScan(instancesPath);
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances: instances1
      });
      try {
        await makeDir(instancesPath);
        await dispatch(startListener());
      } catch (err) {
        console.error(err);
        // eslint-disable-next-line
        new Notification("Error starting NSFW", {
          body: "Could not initialize Node Sentinel File Watcher"
        });
      }
    };

    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_STARTED,
      started: true
    });
    startInstancesListener();
  }

  return result;
};

export default middleware;
