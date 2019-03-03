import { message } from 'antd';
import log from 'electron-log';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import launchCommand from '../utils/MCLaunchCommand';
import { PACKS_PATH } from '../constants';

export const SET_GLOBAL_ARGUMENTS = 'SET_GLOBAL_ARGUMENTS';

export function Arg(args) {
  return dispatch => {
    dispatch({
      type: SET_GLOBAL_ARGUMENTS,
      payload: args,
    });
    console.info("ARGS", args);
  };
}

