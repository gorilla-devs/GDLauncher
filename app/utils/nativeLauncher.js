import path from 'path';
import fsa from 'fs-extra';
import os from 'os';
import log from 'electron-log';

export default async function OfficialLancherProfilesExists() {
  const homedir = process.env.APPDATA || os.homedir();
  const vanillaMCPath = path.join(homedir, '.minecraft');
  if (await fsa.pathExists(vanillaMCPath)) {
    try {
      const vnlJson = await fsa.readJson(
        path.join(vanillaMCPath, 'launcher_profiles.json')
      );
      if (
        vnlJson.authenticationDatabase &&
        vnlJson.selectedUser &&
        vnlJson.clientToken
      ) {
        const { account, profile } = vnlJson.selectedUser;
        return vnlJson.authenticationDatabase[account].profiles[profile]
          .displayName;
      }
    } catch (err) {
      log.error(err);
    }
  }
  return false;
}
