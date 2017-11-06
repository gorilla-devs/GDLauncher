# Twickt Minecraft Launcher
Twickt Launcher is a Minecraft launcher written in C# from scratch!<br>
It's main goal is to be a custom minecraft launcher with the possibility to upload modpacks, check files hashes and more but with a really good-looking graphic. Infact we use <a href="https://material.google.com/">Material Design</a> for it!

#Features
The main features are listed here:
- Custom login through your server and database(mysql)
- Really easy customization
- Multiple languages(under development)
- Parallel files download(up to 30 threads)
- Saves to Cloud synchronization(divided per modpack and version)
- Modpacks Bookmarks system
- Debug Console (With the possibility to save the log)
- Admin Page(to finish)
- Login and Registration page directly in the launcher(using the webservices)
- Bug Reporting Page(through email - webservice)
- Customizable SplashScreen
- Download minecraft directly from their repo
- Find correct versions and download Forge directly from maven repo
- Possibility to temporarily enable login for admin only or to disable the launcher at all(webservices)
- Auto downloader and installer of Java(portable version)(so no problem with the User's java installation, the launcher works even if the user doesn't have java at all)
- Auto Updater through version control(webservices)(you can also set minimum version, under that version the user must update or cannot launch the launcher)
- AntiSpam system
- You can add remote modpacks through webservices and your server and the user can also run local modpacks
- Support to all main versions and snapshots(under development)
- You can setup for remote modpacks the HashCheck at startup. If any file is different from the one on the server it downloads it again. You can also set it to skip some specific files(like config)
- Startup HowTo Guide
- Dynamic and programmatic changelog system (webservices)
- possibility for users to upload modpacks (private / semi-private) (under development)
- Complete website with two factors authentication and a lot more!(coming soon)

#More info
<a href="https://twickt.com/our-launcher/"><b>SEE MORE INFO</b></a>

#See it in action
You can download a demo directly from my official website: https://twickt.com.<br>
It is a working daily use demo, always updated to the latest version but with no guarantee.<br>
If you use our official launcher demo you are supposed to read and agree our <a href="https://twickt.com/terms-of-service/">Terms of Service</a>.

#Make it your own
You are allowed by our licence to fork it and to do anything you want as far as you leave it open source and always mention me as it's developer.
To create your own launcher you need to set up a little infrastructure.<br>
You can follow <a href=""><b>THIS</b></a> setup guide to create your launcher!

#Thanks and mentions
We really need to thank <a href="https://github.com/ButchersBoy">ButchersBoy</a> for his <a href="https://github.com/ButchersBoy/MaterialDesignInXamlToolkit">Material Design XAML Toolkit</a>

#Contributing
If you want to contribute to this project you are more than welcome! Just create a branch, do your stuff and then send it back for revision! You can fork it too if you want, but remember to leave it open source! It is one of our conditions of GNU GPL v3.

#Source Code - LICENCE
The source code of Twickt Launcher is given under GNU GENERAL PUBLIC LICENSE Version 3 Licence.<br>
Read <a href="https://github.com/killpowa/Twickt-Launcher/blob/master/LICENSE">HERE</a> for more informations.<br>
<b>We do not forgive unauthorized uses of this source code. You are expected to follow and respect the licence.</b>

#Some screenshots
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180425.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180512.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180614.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180656.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180724.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-180756.png" width="400">
<img src="https://old.twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-181031.png" width="400">
<img src="https://twickt.com/wp-content/uploads/2016/08/ice_screenshot_20160825-181122.png" width="400">
