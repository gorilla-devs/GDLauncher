module.exports = {
  new: [],
  improvements: [],
  bugfixes: [
    {
      header: 'No longer killing the game',
      content: 'when closing the Launcher.',
      advanced: { cm: '391dd9cc', pr: '1412' }
    },
    {
      header: 'Fixed the game resolution setting',
      content: 'being ignored.',
      advanced: { cm: '87f89ed9', pr: '1429' }
    },
    {
      header: 'Fixed the kill button',
      content: 'having to be clicked twice.',
      advanced: { cm: '2664f8bb', pr: '1419' }
    },
    {
      header: 'Fixed error code one ',
      content: 'when certain java args are missing.',
      advanced: { cm: 'cdae501a', pr: '1420' }
    },
    {
      header: 'Fixed settings resetting',
      content: 'caused by the CurseForge workaround.',
      advanced: { cm: '7f29ca64', pr: '1431' }
    }
  ]
};
