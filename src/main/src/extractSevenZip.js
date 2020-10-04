import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import log from 'electron-log';

export default function extract7z() {
  const baseDir = path.join(app.getAppPath(), 'node_modules', '7zip-bin');

  let zipLocationAsar = path.join(baseDir, 'linux', 'x64', '7za');
  if (process.platform === 'darwin') {
    zipLocationAsar = path.join(baseDir, 'mac', '7za');
  }
  if (process.platform === 'win32') {
    zipLocationAsar = path.join(baseDir, 'win', 'x64', '7za.exe');
  }
  try {
    fs.copyFileSync(
      zipLocationAsar,
      path.join(app.getPath('userData'), path.basename(zipLocationAsar))
    );

    if (process.platform === 'linux' || process.platform === 'darwin') {
      execSync(
        `chmod +x "${path.join(
          app.getPath('userData'),
          path.basename(zipLocationAsar)
        )}"`
      );
      execSync(
        `chmod 755 "${path.join(
          app.getPath('userData'),
          path.basename(zipLocationAsar)
        )}"`
      );
    }
  } catch (e) {
    log.error(e);
  }
}
