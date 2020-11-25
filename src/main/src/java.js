import path from 'path';
import { DB_SCHEMA } from 'src/common/persistedKeys';
import { convertOSToJavaFormat } from '../../common/utils';
import { DB_INSTANCE, USERDATA_PATH } from './config';
import { MANIFESTS } from './manifests';

let _javaOverride;
const readOverrideFromConfig = async () => {
  try {
    _javaOverride = await DB_INSTANCE.get(DB_SCHEMA.persisted.customJavaPath);
  } catch {
    _javaOverride = null;
    // no override
  }
};

export default async function getJavaPath() {
  if (_javaOverride === undefined) {
    await readOverrideFromConfig();
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
