# 0.11.0
- Added custom icons for instances [#112](https://github.com/gorilla-devs/GDLauncher/issues/112)
- Removed user confirmation for appimage installation on linux [#120](https://github.com/gorilla-devs/GDLauncher/issues/120)
- Fixed dependancies being downloaded multiple times [#153](https://github.com/gorilla-devs/GDLauncher/issues/153)
- Fixed delete instance button sometimes going in negative infinite countdown
- Changed (slightly) the style of the scrollbar
- Mods manager (both local mods and mods browser) are now using a virtualized list for better performance
- Added a changelog page when updating the launcher
- Fixed autoupdates on linux
- Local installed mods are now updated in real time
- Already installed mods will now be properly showed when browsing
- Forge versions are now fetched from curse instead of forge
- Removed duplicate natives being downloaded for forge
- Removed forge versions below 1.6.1
- Fixed the scroll position of the mods list when viewing a particular mod description



# 0.10.0 (31.1.2019)

- Fixed missing java warning not showing up
- Changed context menu animation, now it's faster
- Changed modal animation
- Added "Import Pack" option for twitch profiles
- Modal overlay is now blurred
- Added authors names in mods and modpacks
- Updated all dependancies
- Migrated to 32 bit architecture as default. It should save some ram usage and disk space without impactive the performance
- Changed the modpack explorer modal, now it's nicer
- Disabled "delete" and "repair" options while playing the instance
- BREAKING-CHANGE: Added an overview of the selected instance in the sidebar. For curse modpacks downloaded before this update it won't show the correct image.
- Fixed (hopefully) autoupdates on macOS
- Fixed instances names sometimes overflowing
- Fixed youtube videos overflowing in mods description
- Fixed searchbars losing focus after the first character [#149](https://github.com/gorilla-devs/GDLauncher/issues/149)
- Added per-instance played time, it can be seen in the sidebar after selecting an instance
- Added a new autoupdate page with better feedback on the download
- Removed web installer for windows
- Updated the readme with a more recent image and links
- Added a 2 channels update system (stable / beta). Stable updates will come once a month and beta once a week (more or less).


# 0.9.4 (9.1.2019)
- Minecraft console can now be read opening the developer tools (Button on the top left) [#129](https://github.com/gorilla-devs/GDLauncher/issues/129)
- Minecraft is now started using `spawn()` instead of `exec()`. It doesn't overflow anymore [#135](https://github.com/gorilla-devs/GDLauncher/issues/135)
- Fixed desktop shortcuts not working
- Fixed some visual bugs
- "Open Folder" is now cross-platform
- Fixed high CPU usage after installing an instance [#131](https://github.com/gorilla-devs/GDLauncher/issues/131)
- Changed default window size
- Various visual and performance improvements
- Removed aria-label from content-loader
- Removed login proxy. Now GDLauncher connects directly with Mojang's APIs
- Fixed sounds not working for some legacy minecraft version. Sadly under version 1.6.1 there is nothing we can do [#146](https://github.com/gorilla-devs/GDLauncher/issues/146)
- Fixed mods manager crashing when searching for a mod that doesn't exist 
- Added confirmation check when deleting an instance to avoid unwanted deletes
- The RAM slider now adapts to the maximum RAM available in the Computer and the java architecture [#133](https://github.com/gorilla-devs/GDLauncher/issues/133)
- Added default modpack name when installing. You can leave the name field empty now [#66](https://github.com/gorilla-devs/GDLauncher/issues/66)
- Added new modal window design proposal: [see here](https://imgur.com/gallery/A8JRrI4)
- Added validation on instances names. Allowed alphanumeric characters, spaces in between words, dots, dashes and underscores
- Modals now have a maximum size so they don't have huge blank spaces when maxed out
- Added welcome page for new users

# 0.9.3 (6.1.2019)
- Fixed ram being reset when toggling java autodetect [#128](https://github.com/gorilla-devs/GDLauncher/issues/128)
- Updated every console.log to log.log. Now every log is written to the log file
- Added a new theme (Bloody Murder)
- Added more checks for legacy config. Now when the launcher is updated, the old config file should be updated to the new formats if needed [#128](https://github.com/gorilla-devs/GDLauncher/issues/128)
- Fixed the CurseForge modpacks search. It's now more responsive and should give more consistent results [#126](https://github.com/gorilla-devs/GDLauncher/issues/126) [#115](https://github.com/gorilla-devs/GDLauncher/issues/115)
- Started updating the changelog :) [#130](https://github.com/gorilla-devs/GDLauncher/issues/130)
- Added the modpack explorer dialog [#117](https://github.com/gorilla-devs/GDLauncher/issues/117) [#108](https://github.com/gorilla-devs/GDLauncher/issues/108)
- Improved lazy loading performance
- Fixed a bug where clearing the searchbox in the modpacks browser caused the launcher to crash [#125](https://github.com/gorilla-devs/GDLauncher/issues/125) [#116](https://github.com/gorilla-devs/GDLauncher/issues/116)
- Fixed the ram slider color. It now adapts to the themes
