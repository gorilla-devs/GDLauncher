const { Client } = require('discord-rpc');
const log = require('electron-log');

let client;
let activity;

const defaultValue = {
  details: 'Playing GDLauncher',
  state: 'Idle',
  startTimestamp: Math.floor(Date.now() / 1000),
  largeImageKey: 'default_big',
  largeImageText: 'GDLauncher - A Custom Minecraft Launcher',
  instance: false
};

exports.initRPC = () => {
  client = new Client({ transport: 'ipc' });

  activity = defaultValue;

  client.on('ready', () => {
    log.log('Discord RPC Connected');
    client.setActivity(activity);
  });

  client.login({ clientId: '555898932467597312' }).catch(error => {
    if (error.message.includes('ENOENT')) {
      log.error('Unable to initialize Discord RPC, no client detected.');
    } else {
      log.error('Unable to initialize Discord RPC:', error);
    }
  });
};

exports.update = ({ details, state }) => {
  activity = {
    ...activity,
    startTimestamp: Math.floor(Date.now() / 1000),
    details,
    state
  };
  client.setActivity(activity);
};

exports.reset = () => {
  activity = defaultValue;
  client.setActivity(activity);
};

exports.shutdownRPC = () => {
  if (!client) return;
  client.clearActivity();
  client.destroy();
  client = null;
  activity = null;
};
