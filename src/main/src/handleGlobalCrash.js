import log from 'electron-log';

process.on('uncaughtException', error => {
  log.error(error);
  process.exit();
});
