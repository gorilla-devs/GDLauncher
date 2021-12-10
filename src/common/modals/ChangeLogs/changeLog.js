module.exports = {
  new: [
    {
      header: 'Migrated to Java 17.',
      content: 'Now Minecraft 1.18 should work',
      advanced: { cm: '214ac68' }
    },
    {
      header: 'Testing some new monetization techniques.',
      content:
        'These are some preliminary tests in order to make GDLauncher a self-sustained project. Come give us some feedback on our discord server!',
      advanced: { cm: '214ac68' }
    },
    {
      header: 'Added an automatic error reporting system.',
      content:
        'This way we will be able to fix issues even before they are reported!',
      advanced: { cm: '09c8873' }
    },
    {
      header: 'Minecraft Forge 1.18',
      content: 'is now supported',
      advanced: { cm: 'a0b8bec' }
    }
  ],
  improvements: [],
  bugfixes: [
    {
      header: 'Fixed Microsoft login',
      content: 'not working when offline.',
      advanced: { cm: '14346e2' }
    },
    {
      header: 'Fixed a critical security bug',
      content:
        'in Minecraft that allows people to remotely execute code on your computer. Mojang will probably release a fix soon but in the meanwhile we are trying to minimize the impact.',
      advanced: { cm: 'e2cfde4' }
    },
    {
      header: 'Fixed the "update all mods" button.',
      content: 'Sorry for the inconvenience.',
      advanced: { cm: 'd58a46d' }
    }
  ]
};
