import watch from "node-watch";
import makeDir from "make-dir";
import { promises as fs } from "fs";
import * as ActionTypes from "../../../common/reducers/actionTypes";
import getInstances from "./getInstances";

let listener;

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;

  const startListener = () => {
    return watch(
      nextState.settings.instancesPath,
      {
        recursive: true,
        filter: f => true || /(config\.json)|(mods)/.test(f)
      },
      () => {
        getInstances(nextState.settings.instancesPath)
          .then(instances => {
            dispatch({
              type: ActionTypes.UPDATE_INSTANCES,
              instances
            });
            return instances;
          })
          .catch(console.error);
      }
    );
  };

  const instancesPathChanged =
    currState.settings.instancesPath !== nextState.settings.instancesPath;

  // If not initialized yet, start listener and do a first-time read
  if (!nextState.instances.started) {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_STARTED,
      started: true
    });
    getInstances(nextState.settings.instancesPath)
      .then(instances => {
        dispatch({
          type: ActionTypes.UPDATE_INSTANCES,
          instances
        });
        return instances;
      })
      .then(() => {
        listener = startListener();
        listener.on("error", async () => {
          // Check if the folder exists and create it if it doesn't
          await makeDir(nextState.settings.instancesPath);
          if (!listener.isClosed()) {
            listener.close();
          }
          startListener();
        });
        return null;
      })
      .catch(console.error);
  } else if (listener && instancesPathChanged) {
    // If the path changed, close the previous listener and start a new one
    if (!listener.isClosed()) {
      listener.close();
    }
    startListener();
  }

  return result;
};

export default middleware;
