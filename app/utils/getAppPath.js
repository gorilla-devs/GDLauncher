module.exports = {
  getAppPath: () => {
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      return `${process.env.PORTABLE_EXECUTABLE_DIR}/`;
    }
    return `${process.cwd()}/`;
  }
};
