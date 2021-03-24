const { spawnSync } = require('child_process');

spawnSync('vs_installer.exe', ['/uninstall', '--passive'], {
  shell: true,
  stdio: [process.stdio, process.stdio, process.stderr],
  cwd: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer'
});
