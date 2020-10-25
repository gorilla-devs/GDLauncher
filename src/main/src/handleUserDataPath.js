import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export default function handleUserDataPath() {
  app.setPath('userData', path.join(app.getPath('appData'), 'gdlauncher_next'));

  if (
    process.env.REACT_APP_RELEASE_TYPE === 'portable' &&
    process.platform !== 'linux'
  ) {
    app.setPath(
      'userData',
      path.join(path.dirname(app.getPath('exe')), 'data')
    );
  } else {
    const overrideExists = fs.existsSync(
      path.join(app.getPath('userData'), 'override.data')
    );
    if (overrideExists) {
      const override = fs.readFileSync(
        path.join(app.getPath('userData'), 'override.data')
      );
      app.setPath('userData', override.toString());
    }
  }
  console.log('INITIALIZED APPDATA');
}
