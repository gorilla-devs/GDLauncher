const REQUIRED_NODE_VERSION = 'v14.14.0';
const REQUIRED_NODE_ARCH = 'x64';
const NODE_ARCH_VALID = process.arch === REQUIRED_NODE_ARCH;

if (process.version !== REQUIRED_NODE_VERSION || !NODE_ARCH_VALID) {
  throw new Error(`Please install node ${REQUIRED_NODE_VERSION} x64`);
}
