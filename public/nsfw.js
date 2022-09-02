/* eslint-disable global-require */
const { promises: fs } = require('fs');
const path = require('path');
// const os = require('os');

const NSFW = require('./native/nsfw.node');

function NSFWFilePoller(watchPath, eventCallback, debounceMS) {
  const { CREATED, DELETED, MODIFIED } = nsfw.actions;
  const directory = path.dirname(watchPath);
  const file = path.basename(watchPath);

  let fileStatus;
  let filePollerInterval;

  const getStatus = async () => {
    try {
      const status = await fs.stat(watchPath);
      if (fileStatus === null) {
        fileStatus = status;
        eventCallback([{ action: CREATED, directory, file }]);
      } else if (
        status.mtime - fileStatus.mtime !== 0 ||
        status.ctime - fileStatus.ctime !== 0
      ) {
        fileStatus = status;
        eventCallback([{ action: MODIFIED, directory, file }]);
      }
    } catch (e) {
      if (fileStatus !== null) {
        fileStatus = null;
        eventCallback([{ action: DELETED, directory, file }]);
      }
    }
  };

  this.start = async () => {
    try {
      fileStatus = await fs.stat(watchPath);
    } catch (e) {
      fileStatus = null;
    }

    filePollerInterval = setInterval(getStatus, debounceMS);
  };

  this.stop = async () => {
    clearInterval(filePollerInterval);
  };

  this.pause = () => this.stop();
  this.resume = () => this.start();
}

const buildNSFW = async (
  watchPath,
  eventCallback,
  { debounceMS = 500, errorCallback: _errorCallback } = {}
) => {
  if (Number.isInteger(debounceMS)) {
    if (debounceMS < 1) {
      throw new Error('Minimum debounce is 1ms.');
    }
  } else {
    throw new Error('debounceMS must be an integer.');
  }

  const errorCallback =
    _errorCallback ||
    (nsfwError => {
      throw nsfwError;
    });

  if (!path.isAbsolute(watchPath)) {
    throw new Error('Path to watch must be an absolute path.');
  }

  let stats;
  try {
    stats = await fs.stat(watchPath);
  } catch (e) {
    throw new Error('Path must be a valid path to a file or a directory.');
  }

  if (stats.isDirectory()) {
    return new NSFW(watchPath, eventCallback, { debounceMS, errorCallback });
  }
  if (stats.isFile()) {
    return new NSFWFilePoller(watchPath, eventCallback, debounceMS);
  }
  throw new Error('Path must be a valid path to a file or a directory');
};

function nsfw(watchPath, eventCallback, options) {
  if (!(this instanceof nsfw)) {
    return buildNSFW(watchPath, eventCallback, options).then(
      // eslint-disable-next-line
      implementation => new nsfw(implementation)
    );
  }

  const implementation = watchPath;

  this.start = () => implementation.start();
  this.stop = () => implementation.stop();
  this.pause = () => implementation.pause();
  this.resume = () => implementation.resume();
}

nsfw.actions = {
  CREATED: 0,
  DELETED: 1,
  MODIFIED: 2,
  RENAMED: 3
};

nsfw._native = NSFW;

if (NSFW.getAllocatedInstanceCount) {
  nsfw.getAllocatedInstanceCount = NSFW.getAllocatedInstanceCount;
}

module.exports = nsfw;
