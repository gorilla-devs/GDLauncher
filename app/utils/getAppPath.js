import os from 'os';

const getAppPath = async () => {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return process.env.PORTABLE_EXECUTABLE_DIR;
  }
  return process.cwd();
};

export default getAppPath;
