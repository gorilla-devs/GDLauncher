module.exports = [
  {
    version: 'v1.1.18', // ----------------------------------------------Release
    improvements: [
      {
        header: 'Properly fixed Log4Shell',
        content:
          '0 day exploit for all instances. Now started instances are forced to use a fixed version of the library.',
        advanced: { cm: 'b507abe7' }
      }
    ]
  },
  {
    version: 'v1.1.17', // ----------------------------------------------Release
    bugfixes: [
      {
        header: 'Fixed the "update all mods" button.',
        content: 'Sorry for the inconvenience.',
        advanced: { cm: 'd58a46d' }
      }
    ]
  },
  {
    version: 'v1.1.16', // ----------------------------------------------Release
    bugfixes: [
      {
        header: 'Fixed a critical security bug',
        content:
          'in Minecraft that allows people to remotely execute code on your computer. Mojang will probably release a fix soon but in the meanwhile we are trying to minimize the impact.',
        advanced: { cm: 'e2cfde4' }
      }
    ]
  },
  {
    version: 'v1.1.16-beta.4',
    improvements: [
      {
        header: 'Improved the CreateServer ad.',
        advanced: { cm: 'e761dc28' },
        betaOnly: true
      }
    ],
    bugfixes: [
      {
        header: 'Fixed the InstanceStartup modal',
        content: 'interfering whit the crash modal',
        advanced: { cm: 'a0b8bec7' },
        betaOnly: true
      },
      {
        header: 'Removed the previously changed play button',
        content: "because people didn't like it.",
        advanced: { cm: 'd1ad8882' },
        betaOnly: true
      },
      {
        header: 'Fixed the Java modal',
        content: 'always appearing on startup.',
        advanced: { cm: 'f440b8f1' }
      }
    ]
  },
  {
    version: 'v1.1.16-beta.3',
    bugfixes: [
      {
        header: 'Fixed Discord RPC',
        content: "resetting when Discord wasn't opened",
        advanced: { cm: '49589f25' }
      }
    ]
  },
  {
    version: 'v1.1.16-beta.2',
    new: [
      {
        header: 'Added an automatic error reporting system.',
        content:
          'This way we will be able to fix issues even before they are reported!',
        advanced: { cm: '09c8873' }
      }
    ]
  },
  {
    version: 'v1.1.16-beta.1',
    new: [
      {
        header: 'Testing some new monetization techniques.',
        content:
          'These are some preliminary tests in order to make GDLauncher a self-sustained project. Come give us some feedback on our discord server!',
        advanced: { cm: '214ac68' }
      },
      {
        header: 'Migrated to Java 17.',
        content: 'Now Minecraft 1.18 should work.',
        advanced: { cm: '214ac68' }
      }
    ],
    bugfixes: [
      {
        header: 'Fixed Microsoft login',
        content: 'not working when offline.',
        advanced: { cm: '14346e2' }
      }
    ]
  },
  {
    version: 'v1.1.15' // ----------------------------------------------Release
  },
  {
    version: 'v1.1.15-beta.7',
    improvements: [
      {
        header: 'Disabled symlink option for non-Windows',
        content: 'because it is not needed and not working there.',
        advanced: { cm: '7d8289b2', pr: '1097' }
      }
    ]
  },
  {
    version: 'v1.1.15-beta.6',
    new: [
      {
        header: 'Added option to open the export folder',
        content: 'after exporting an instance',
        advanced: { cm: 'e15d6548', pr: '1082' }
      }
    ]
  },
  {
    version: 'v1.1.15-beta.5',
    new: [
      {
        header: 'Option to sort Instances',
        content: 'by selecting the preferred order in the settings. :D',
        advanced: { cm: 'dda24322', pr: '887' }
      }
    ],
    bugfixes: [
      {
        header: 'Fixed some wording and punctuation',
        content: 'in the settings',
        advanced: { cm: '248d8ae8', pr: '1080', ms: 'Good eye Huantian!' }
      },
      {
        header: 'Fixed squashed Image',
        content: 'in the screenshots',
        advanced: { cm: '17e3f8b8', pr: '1074' }
      }
    ]
  },
  {
    version: 'v1.1.15-beta.4',
    new: [
      {
        header: 'Added setting to use Symlinks',
        content: 'instead of absolute paths to fix issues whit to long paths',
        advanced: { cm: 'abe61b07' }
      }
    ],
    improvements: [
      {
        header: 'Updated Electron',
        content: 'and murmur2 dependencies to their latest versions.',
        advanced: { cm: 'f03d81b5', ms: 'Upgraded Electron to v15.1.0' }
      },
      {
        header: 'Batching multiple CurseForge requests together',
        content: 'to increase request performance',
        advanced: { cm: '422f9caf' }
      },
      {
        header: 'Changed the buttons in the Mod Browser',
        content: 'to good looking icons',
        advanced: { cm: '399939a5', pr: '1035' }
      }
    ],
    bugfixes: [
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
        header: 'Fixed startup crash',
        content: 'only occurring in beta',
        advanced: { cm: '1cff7e08' },
        betaOnly: true
      },
      {
        header: 'Fixed icons in .deb release',
        content: 'not showing up.',
        advanced: { cm: 'a7f1cb35', pr: '1039' }
      }
    ]
  },
  {
    version: 'v1.1.15-beta.3',
    new: [
      {
        header: 'Moved from Patreon to Ko-fi',
        content: 'as you can see above',
        advanced: { cm: 'a95c6e1c' }
      },
      {
        header: 'Started rollout of custom APIs',
        content:
          'because CurseForge is planning to close their APIs in the future. ' +
          'These custom APIs are disabled at the moment.',
        advanced: { cm: '2b37e27a', ms: 'Noo CurseForge, why?' }
      }
    ],
    improvements: [
      {
        header: 'Added a "Check for updates" button',
        content: 'to release CurseForge from a lot of automated API requests',
        advanced: { cm: 'f12465f2' }
      }
    ],
    bugfixes: [
      {
        header: 'Fixed mod file hash check',
        advanced: { cm: '5fd0deb4' }
      }
    ]
  },
  {
    version: 'v1.1.15-beta.2',
    bugfixes: [
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
        header: 'Fixed beta releases on Portable',
        content: 'not downloading.',
        advanced: { cm: 'e32ee91f' }
      },
      {
        header: 'Fixed MacOS navbar logo',
        content: 'being a bit to far on the right',
        advanced: { cm: '5a245c99', pr: '1074' }
      },
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
      }
    ]
  },
  {
    version: 'v1.1.15-beta.1',
    bugfixes: [
      {
        header: 'Fixed console error on Beta channel',
        content: 'where release channel was undefined.',
        advanced: { cm: '7528e587', pr: '1045/d185730' }
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
      }
    ]
  },
  {
    version: 'v1.1.14',
    improvements: [
      {
        header: 'Modal animation is now smoother and simpler.',
        content: 'This should make it feel "faster".',
        advanced: { cm: '86ff6a7e' }
      }
    ],
    bugfixes: [
      {
        header: 'Fixed crash',
        content: 'when renaming instances.',
        advanced: { cm: '12de2e88' }
      },
      {
        header: 'Fixed news',
        content: 'not being correctly parsed sometimes.',
        advanced: { cm: 'e7fd5bf8' }
      },
      {
        header: 'Fixed export',
        content: 'not exporting correctly lol.',
        advanced: { cm: '47d8382f' }
      },
      {
        header: 'Fixed crash',
        content: 'when browsing mods.',
        advanced: { cm: '9f4120a4' }
      }
    ]
  },
  {
    version: 'v1.1.13',
    bugfixes: [
      {
        header: 'Fixed google actions',
        advanced: { cm: '473a5f58' }
      }
    ]
  },
  {
    version: 'v1.1.11',
    new: [
      {
        header: 'We now automatically take care of java16.',
        content:
          'You can now run Minecraft >1.17 without issues!. You can also individually select a manual path for both versions from the settings.'
      },
      {
        header: 'You can now easily duplicate instances.',
        content: 'Just right-click on an instance and duplicate it.'
      },
      {
        header: 'Added support for forge 1.17!',
        content:
          "Let's hope they don't change their stuff again anytime soon 😬."
      },
      {
        header: 'Added privacy policy, ToS and acceptable use policy!',
        content:
          "You can go read them from the settings page if you're into legal stuff."
      }
    ],
    improvements: [
      {
        header: 'You can now select more java memory',
        content:
          'in the memory slider up to the amount available on your device.'
      },
      {
        header: 'Improved the design of the changelog modal',
        content: 'as you can clearly see from here 😃.'
      },
      {
        header: 'Added social links to the settings sidebar',
        content: ''
      },
      {
        header: 'Drastically improved performance',
        content:
          'for modal pages such as instances creator, instances manager and settings.'
      },
      {
        header: 'Updated dependencies',
        content: 'for security and performance improvements.'
      },
      {
        header: 'Added usual MacOS default menu'
      },
      {
        header: 'Improved Discord RPC.',
        content:
          "It now shows the modpack / MC version you're playing. The modpack name will only be shown for new instances."
      }
    ],
    bugfixes: [
      {
        header: 'Fixed accounts being hidden',
        content: 'when too many were added.'
      },
      {
        header: 'Fixed concurrent download preference',
        content: 'not being used when downloading FTB modpacks.'
      },
      {
        header: 'Fixed fabric mods not loading',
        content: 'due to curseforge changing their backend structure.'
      },
      {
        header:
          "Fixed a bug where we didn't correctly detect the curseforge modloader.",
        content: ''
      },
      {
        header: 'Fixed imports from external sources.',
        content: 'Both local zips and remote urls should now work correctly.'
      }
    ]
  }
];
