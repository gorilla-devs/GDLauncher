import { execSync } from 'child_process';
import log from 'electron-log';
import { get7zPath } from './helpers';

export default function fix7zPermissions() {
  try {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      execSync(`chmod +x "${get7zPath()}"`);
      execSync(`chmod 755 "${get7zPath()}"`);
    }
  } catch (e) {
    log.error(e);
  }
}
