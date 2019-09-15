import { promisify } from 'util';
import { exec } from 'child_process';
import log from 'electron-log';
import { getJavaPath } from '../reducers/actions';

export const isGlobalJavaOptions = async dispatch => {
  const javaPath = await dispatch(getJavaPath());
  try {
    const { stdout, stderr } = await promisify(exec)(`"${javaPath}" -version`);
    const validOutput = stdout === '' ? stderr : stdout;
    return (
      validOutput.includes('_JAVA_OPTIONS') && validOutput.includes('-Xmx')
    );
  } catch (e) {
    log.info(`Could not check for global java options: ${e.message}`);
    return false;
  }
};

export const checkJavaArch = async javaPath => {
  const { stdout, stderr } = await promisify(exec)(`"${javaPath}" -version`);
  if (stderr.includes('Error') || stdout.includes('Error')) return false;
  return true;
};
