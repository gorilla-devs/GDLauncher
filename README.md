# GDLauncher

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/contains-cat-gifs.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) 

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![GitHub issues](https://img.shields.io/github/issues-raw/gorilla-devs/GDLauncher.svg)](https://github.com/gorilla-devs/GDLauncher/issues) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/213eb618fa59424fba7ccfcd4f1b6a09)](https://www.codacy.com/app/gorilla-devs/GDLauncher?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gorilla-devs/GDLauncher&amp;utm_campaign=Badge_Grade)  [![GitHub pull requests](https://img.shields.io/github/issues-pr/gorilla-devs/GDLauncher.svg)](https://github.com/gorilla-devs/GDLauncher/pulls) 

[![PRs Welcome](https://img.shields.io/github/license/gorilla-devs/GDLauncher.svg)](http://makeapullrequest.com) [![Travis](https://img.shields.io/travis/gorilla-devs/GDLauncher.svg)](https://travis-ci.org/gorilla-devs/GDLauncher) ![Discord](https://img.shields.io/discord/398091532881756161.svg) ![David](https://img.shields.io/david/gorilla-devs/GDLauncher.svg) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/gorilla-devs/GDLauncher.svg)

[![GitHub package version](https://img.shields.io/github/package-json/v/gorilla-devs/GDLauncher.svg)](https://github.com/gorilla-devs/GDLauncher/blob/master/package.json) ![Github All Releases](https://img.shields.io/github/downloads/gorilla-devs/GDLauncher/total.svg) [![Read the Docs (version)](https://img.shields.io/readthedocs/gdlauncher/master.svg)](https://gdlauncher.readthedocs.io/en/master/)

<p align="center">
    <img width="800" height="auto" src="https://i.imgur.com/6IZ2kjC.png" alt="GDLauncher" />
</p>

<details>
 <summary><strong>Table of Contents</strong> (click to expand)</summary>

* [Getting Started](#-getting-started)
* [Features](#️-features-working-on)
* [Compilation](#️-compilation)
* [Compilation Requirements](#-requirements)
* [Compilation Steps](#-steps)
* [Packaging](#-packaging)
* [Built and Managed with](#️-built-and-managed-with)
* [Contributing](#-contributing)
* [Versioning](#-versioning)
* [Authors](#-authors)
* [License](#-license)
* [Todos](#-todos)
</details>


GDLauncher is a custom open source Minecraft launcher written from the ground up in electron/react. It's main goal is to make it easy and enjoyable to manage different Minecraft versions and servers, bringing the playing and modding experience to the next level!

## 🚀 Getting Started
Below you will find anything you need to know about the launcher. If you want to download a stable release you can do it from our official website: https://gorilladevs.com, if you want the latest testing features you can clone the repo and compile it yourself.

## 🎨 Features (Working on)

  - Java Autorunner. (You don't need to have java installed, a suitable version will be downloaded automatically)
  - Log console. Always know what's happening
  - It's as easy as pie to install either the vanilla game and to install forge. No further action from the user is required.
  - It goes without saying that it has a built-in autoupdater, so you will never need to download a new version manually.
  - Vanilla, Forge and Curse modpacks download and autoupdater
  - Built-in manager for Minecraft servers
  - Cloud sync of game saves. With this you will never lose your saves again!

You can also:
  - Import and export modpacks from and to other launchers
  - Drag and drop instances wherever you like them, just like in your desktop
  - Keep track of the time you played each instance
  - Add instances to the download queue, they will automatically download one after the other
  - Manage your minecraft skin directly from the launcher
  - Directly connect to a server from the launcher using quick launch

Keep in mind that not all of these features are yet part of the launcher. We are constantly updating the code adding new features. Feel free to help us :)

## 💾 Compilation

These are the steps to compile it yourself.

### ⚙️ Requirements
You need the following softwares installed:
  - Nodejs (> 8)
  - yarn

### ▶️ Steps

Install the dependencies and devDependencies.

```sh
$ cd GDLauncher
$ yarn
```

Start the development environment

```sh
$ yarn dev
```

For production environment...

```sh
$ yarn start
```

### 🚚 Packaging

To package apps for the local platform:

```sh
$ npm run package
```

To package apps for all platforms:

First, refer to [Multi Platform Build](https://www.electron.build/multi-platform-build) for dependencies.

Then,
```bash
$ npm run package-all
```

## 🚀 Built and managed with 

* [Javascript](https://developer.mozilla.org/bm/docs/Web/JavaScript) - Language used
* [React](https://reactjs.org/) - JS Framework
* [Redux](https://redux.js.org/) - React state management
* [NodeJS](https://nodejs.org/en/) - JS Runtime
* [Electron](https://electronjs.org/) - JS Framework
* [Travis CI](https://travis-ci.org/) - CI Service
* [Codacy](https://www.codacy.com/) - Automated code review
* [Webpack](https://webpack.js.org/) - JS module bundler
* [Babel](https://babeljs.io/) - JS Transpiler
* [ESLint](https://eslint.org/) - JS Linter
* [Ant Design](https://ant.design/) - UI Design Language

## 🎁 Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## 📜 Versioning

We use [SemVer](http://semver.org/) as versioning system.

## ❤️ Authors

* **Davide Ceschia** - *Initial work* - [GorillaDevs](https://github.com/gorilla-devs)

See also the list of [contributors](https://github.com/gorilla-devs/GDLauncher/contributors) who participated in this project.

## 🎓 License

This project is licensed under the GNU GPL V3.0 - see the [LICENSE](LICENSE) file for details

## ✏️ Todos
Here is the complete list of things we want to do. If you want to help us doing them or want to suggest some new ideas, comment here!
[TODOS/IDEAS](https://github.com/gorilla-devs/GDLauncher/issues/70)

