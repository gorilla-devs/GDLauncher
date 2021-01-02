const REQUIRED_NODE_VERSION = 'v15.5.0';

if (process.version !== REQUIRED_NODE_VERSION) {
  throw new Error(`Please install node ${REQUIRED_NODE_VERSION} x64`);
}
