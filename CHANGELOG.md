# 0.9.4 (9.1.2019)
- Minecraft console can now be read opening the developer tools (Button on the top left) [#129](https://github.com/gorilla-devs/GDLauncher/issues/129)
- Minecraft is now started using `spawn()` instead of `exec()`. It doesn't overflow anymore [#135](https://github.com/gorilla-devs/GDLauncher/issues/135)
- Fixed shortcuts not working
- Fixed some visual bugs
- "Open Folder" is now cross-platform
- Fixed high CPU usage after installing an instance [#131](https://github.com/gorilla-devs/GDLauncher/issues/131)
- Changed default window size
- Various performance improvements
- Removed aria-label from content-loader

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