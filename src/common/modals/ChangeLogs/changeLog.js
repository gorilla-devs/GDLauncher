module.exports = {
  new: [
    {
      header: 'Started rollout of custom APIs',
      content:
        'because CurseForge is planning to close their APIs in the future. ' +
        'These custom APIs are disabled at the moment.',
      advanced: { cm: '2b37e27a', ms: 'Noo CurseForge, why?' }
    },
    {
      header: 'Moved from Patreon to Ko-fi',
      content: 'as you can see above',
      advanced: { cm: 'a95c6e1c' }
    },
    {
      header: 'Added setting to use Symlinks',
      content: 'instead of absolute paths to fix issues whit to long paths',
      advanced: { cm: 'abe61b07' }
    },
    {
      header: 'Option to sort Instances',
      content: 'by selecting the preferred order in the settings. :D',
      advanced: { cm: 'dda24322', pr: '887' }
    },
    {
      header: 'Added option to open the export folder',
      content: 'after exporting an instance',
      advanced: { cm: 'e15d6548', pr: '1082' }
    }
  ],
  improvements: [
    {
      header: 'Added a "Check for updates" button',
      content: 'to release CurseForge from a lot of automated API requests',
      advanced: { cm: 'f12465f2' }
    },
    {
      header: 'Changed the buttons in the Mod Browser',
      content: 'to good looking icons',
      advanced: { cm: '399939a5', pr: '1035' }
    },
    {
      header: 'Updated Electron',
      content: 'and murmur2 dependencies to their latest versions.',
      advanced: { cm: 'f03d81b5', ms: 'Upgraded Electron to v15.1.0' }
    },
    {
      header: 'Batching multiple CurseForge requests together',
      content: 'to increase request performance',
      advanced: { cm: '422f9caf' }
    }
  ],
  bugfixes: [
    {
      header: 'Fixed 7zip not unzipping',
      content: 'the downloaded files.',
      advanced: {
        cm: '2240004d',
        ms:
          'You want to know the true story? He did this, then I told him ' +
          "that it doesn't work so he did it again and it partially worked. " +
          'Then, third time, he stole my working code and committed it! :o'
      }
    },
    {
      header: 'Fixed MacOS .DS_Store files',
      content: 'being detected as instances.',
      advanced: { cm: '7528e587', pr: '1045/511af67' }
    },
    {
      header: 'Fixed ModBrowser icons',
      content: 'not being sized correctly.',
      advanced: { cm: '7528e587', pr: '1045/9a35c56' }
    },
    {
      header: 'Corrected wrong spelled CSS code',
      content: 'which was inherited anyways.',
      advanced: { cm: '7528e587', pr: '1045' }
    },
    {
      header: 'Fixed console error on Beta channel',
      content: 'where release channel was undefined.',
      advanced: { cm: '7528e587', pr: '1045/d185730' }
    },
    {
      header: 'Fixed MacOS navbar logo',
      content: 'being a bit to far on the right',
      advanced: { cm: '5a245c99', pr: '1074' }
    },
    {
      header: 'Fixed beta releases on Portable',
      content: 'not downloading.',
      advanced: { cm: 'e32ee91f' }
    },
    {
      header: 'Hopefully fixed FTB downloads',
      content: 'failing because of invalid file hashes',
      advanced: {
        cm: '77988a42',
        ms:
          "In reality I don't really know what davide did there, I just " +
          'pretend to do so ;)'
      }
    },
    {
      header: 'Fixed mod file hash check',
      advanced: { cm: '5fd0deb4' }
    },
    {
      header: 'Fixed icons in .deb release',
      content: 'not showing up.',
      advanced: { cm: 'a7f1cb35', pr: '1039' }
    },
    {
      header: 'Fixed startup crash',
      content: 'only occurring in beta',
      advanced: { cm: '1cff7e08' }
    },
    {
      header: 'Fixed squashed Image',
      content: 'in the screenshots',
      advanced: { cm: '17e3f8b8', pr: '1074' }
    },
    {
      header: 'Fixed crash',
      content: 'when switching tabs too fast',
      advanced: {
        cm: '17e3f8b8',
        pr: '1074',
        ms: 'You will need a good mouse to experience that :)'
      }
    },
    {
      header: 'Fixed some wording and punctuation',
      content: 'in the settings',
      advanced: { cm: '248d8ae8', pr: '1080', ms: 'Good eye Huantian!' }
    },
    {
      header: 'Disabled symlink option for non-Windows',
      content: 'because it is not needed and not working there.',
      advanced: { cm: '7d8289b2', pr: '1097' }
    }
  ]
};
