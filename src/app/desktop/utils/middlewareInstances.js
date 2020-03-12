// import watch from "node-watch";
import makeDir from "make-dir";
import path from "path";
import { ipcRenderer } from "electron";
import { _getTempPath } from "../../../common/utils/selectors";
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
      const instances1 = await modsFingerprintsScan(
        instancesPath,
        _getTempPath(nextState)
      );
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances: instances1
      });
      try {
        await dispatch(startListener());
      } catch (err) {
        console.error(err);
        // Check if the folder exists and create it if it doesn't
        await ipcRenderer.invoke("stop-listener");
        await makeDir(instancesPath);
        await dispatch(startListener());
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
