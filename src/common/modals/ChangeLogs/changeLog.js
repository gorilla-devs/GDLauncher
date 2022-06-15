module.exports = {
  new: [
    {
      header:
        "Curseforge's opted out mods can now be downloaded directly from GDLauncher!",
      content:
        'When a mod / modpack decided to opt out, we will open a browser window within GDLauncher and intercept the download.',
      advanced: { cm: '' }
    }
  ],
  improvements: [
    {
      header:
        'Before starting a modpack update GDLauncher will now create a restore point.',
      content:
        'If the update process fails, GDLauncher will rollback the last working backup.',
      advanced: { cm: '' }
    },
    {
      header:
        'Updated electron to the latest version (Chrome 96 - Electron 19).',
      content: 'This brings a lot of security and performance improvements.',
      advanced: { cm: '' }
    }
  ],
  bugfixes: [
    {
      header: 'Fixed crashes in the mods manager.',
      content: '',
      advanced: { cm: '' }
    },
    {
      header: 'Fixed resource packs not being saved in the correct location.',
      content: '',
      advanced: { cm: '' }
    }
  ]
};
