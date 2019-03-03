import { message } from 'antd';
import log from 'electron-log';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import launchCommand from '../utils/MCLaunchCommand';
import { PACKS_PATH } from '../constants';

export const SET_GLOBALARGUMENTS = 'SET_GLOBALARGUMENTS';

export function Arg(args) {
  return dispatch => {
    dispatch({
      type: SET_GLOBALARGUMENTS,
      payload: args
    });
    console.info("ARGS", args);
  };
}

