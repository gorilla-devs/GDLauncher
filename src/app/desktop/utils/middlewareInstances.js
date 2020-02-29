// import watch from "node-watch";
import makeDir from "make-dir";
import path from "path";
import { debounce } from "lodash";
import watch from "node-watch";
import { _getTempPath } from "../../../common/utils/selectors";
import * as ActionTypes from "../../../common/reducers/actionTypes";
import getInstances from "./getInstances";
import modsFingerprintsScan from "./modsFingerprintsScan";

let listener;

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
    const startListener = () => {
      let events = [];
      const updateInstances = debounce(
        async instancesPath => {
          const instances = await getInstances(instancesPath, events);
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances
          });
          const instances1 = await modsFingerprintsScan(
            instancesPath,
            _getTempPath(nextState),
            events
          );
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances: instances1
          });
          events = [];
        },
        1000,
        { maxWait: 2500, leading: true, trailing: false }
      );
      return watch(
        instancesPath,
        {
          recursive: true,
          filter: f =>
            /^(\\|\/)([\w\d-.{}()[\]@#$%^&!])+((\\|\/)mods((\\|\/)(.*))?)?$/.test(
              f.replace(instancesPath, "")
            )
        },
        (e, fileName) => {
          events.push([e, fileName]);
          updateInstances(instancesPath).catch(console.error);
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
      const instances1 = await modsFingerprintsScan(
        instancesPath,
        _getTempPath(nextState)
      );
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances: instances1
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

    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_STARTED,
      started: true
    });
    startInstancesListener();
  }

  return result;
};

export default middleware;
