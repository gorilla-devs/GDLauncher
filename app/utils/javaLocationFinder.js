import { promisify } from 'es6-promisify';
import os from 'os';
import fs from 'fs';
import {
  LINUX,
  WINDOWS,
  DARWIN
} from '../constants';
import { extractLibs, extractMainJar } from '../workers/common/vanilla';
import store from '../localStore';

const findJavaHome = async () => {
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  let command = null;
  switch (os.platform()) {
    case LINUX:
    case DARWIN:
      command = 'which java';
      break;
    case WINDOWS:
      command = 'where java';
      break;
    default:
      break;
  }
  const path = await exec(command);
  return path;
};

export default findJavaHome;
