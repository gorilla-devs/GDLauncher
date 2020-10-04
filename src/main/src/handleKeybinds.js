const { Menu } = require('electron');

const edit = {
  label: 'Edit',
  submenu: [
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      selector: 'cut:'
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      selector: 'copy:'
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      selector: 'paste:'
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      selector: 'selectAll:'
    }
  ]
};

export default function handleKeybinds() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([edit]));
}
