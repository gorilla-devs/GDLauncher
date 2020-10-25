import path from 'path';
import { promises as fs } from 'fs';
import { convertOSToJavaFormat } from '../../common/utils';
import { USERDATA_PATH } from './config';
import { MANIFESTS } from './manifests';

let _javaOverride;
const readOverrideFromFile = async () => {
  try {
    _javaOverride = await fs.readFile(USERDATA_PATH, 'java.data');
  } catch {
    _javaOverride = null;
    // no override
  }
};

export default async function getJavaPath() {
  if (_javaOverride === undefined) {
    await readOverrideFromFile();
  }

  if (_javaOverride) return _javaOverride;
  const javaOs = convertOSToJavaFormat(process.platform);
  const javaMeta = MANIFESTS.java.find(
    v => v.os === javaOs && v.architecture === 'x64' && v.binary_type === 'jre'
  );
  const {
    version_data: { openjdk_version: version }
  } = javaMeta;
  const filename = process.platform === 'win32' ? 'java.exe' : 'java';
  return path.join(USERDATA_PATH, 'java', version, 'bin', filename);
}
