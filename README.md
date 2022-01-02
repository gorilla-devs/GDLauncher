# GDLauncher
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity) 
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) 
[![GitHub issues](https://img.shields.io/github/issues-raw/gorilla-devs/GDLauncher.svg)](https://github.com/gorilla-devs/GDLauncher/issues) 
[![GitHub pull requests](https://img.shields.io/github/issues-pr/gorilla-devs/GDLauncher.svg)](https://github.com/gorilla-devs/GDLauncher/pulls) 
![Discord](https://img.shields.io/discord/398091532881756161.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/gorilla-devs/GDLauncher.svg) 
![](https://img.shields.io/github/release/gorilla-devs/GDLauncher.svg?style=flat)
![Github All Releases](https://img.shields.io/github/downloads/gorilla-devs/GDLauncher/total.svg)

## 🦺 Support this project

<a href='https://ko-fi.com/gdlauncher' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
## 🎉 Join our community

<a href='https://discord.gdlauncher.com' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.gdlauncher.com/assets/socials/Discord-Logo+Wordmark-Color.png' border='0' alt='GDLauncher Discord Server' /></a>
<details>
 <summary><strong>Table of Contents</strong> (click to expand)
</summary>

- [GDLauncher](#gdlauncher)
  - [🦺 Support this project](#-support-this-project)
  - [🎉 Join our community](#-join-our-community)
  - [🎮 What is GDLauncher](#-what-is-gdlauncher)
  - [⚡️ Comparison with Twitch Launcher](#️-comparison-with-twitch-launcher)
  - [🚀 Getting Started](#-getting-started)
  - [🎮 Download](#-download)
  - [🎨 Features](#-features)
      - [Our features:](#our-features)
      - [You can also:](#you-can-also)
      - [Some of the features we are still working on are:](#some-of-the-features-we-are-still-working-on-are)
  - [💾 Compilation](#-compilation)
    - [⚙️ Requirements](#️-requirements)
    - [▶️ Steps](#️-steps)
    - [🚚 Packaging](#-packaging)
  - [🚀 Technologies](#-technologies)
  - [🎁 Contributing](#-contributing)
  - [❤️ Author](#️-author)
  - [📜 History](#-history)
  - [🎓 License](#-license)
  </details>

<p align="center">
    <img width="800" height="auto" src="https://gdevs.io/showcase.jpg" alt="GDLauncher" />
</p>

## 🎮 What is GDLauncher

GDLauncher is a custom open-source Minecraft launcher written from the ground up in electron/react. Its main goal is to make it easy and enjoyable to manage different Minecraft versions and install `forge/fabric`, bringing the playing and modding experience to the next level!

## ⚡️ Comparison with Twitch Launcher

This is an example of the time that GDLauncher takes to install a modpack in comparison to Twitch. Both tests are running at the same time over a 1Gbps network to ensure that the network doesn't impact the comparison.

- GDLauncher: `52s`
- Twitch Launcher: `145s`

<p align="center">
    <img width="800" height="auto" src="https://gdevs.io/comparison.gif" alt="GDLauncher" />
</p>

## 🚀 Getting Started

Below you will find everything you need to know about the launcher. If you want to download the latest stable release you can do it from our official website ([gdevs.io](https://gdevs.io)). If you want to test the possibly unstable features, you can clone the repo and compile it yourself.

## 🎮 Download

To download the latest version, you can either click [here](https://github.com/gorilla-devs/GDLauncher/releases) and select the appropriate version for your operating system or visit our [website](https://gdevs.io).

## 🎨 Features

#### Our features:

- Java downloader. You don't need to have java installed, a suitable version will be downloaded automatically.
- It's as easy as pie to install the `vanilla` game, `forge`, `fabric`, and all `curseforge modpacks`. No further action from the user is required.
- Install `mods` for both fabric and forge directly from our UI
- Built-in auto-updater. The launcher will always keep itself updated to the latest release.
- Easily manage multiple `accounts` and switch between them.
- Still playing on your grandma pc from the 80s? Don't worry, we got you covered with our `Potato PC Mode`!

#### You can also:

- Import modpacks from other launchers
- Keep track of the time you played each instance
- Add instances to the download queue, they will automatically download one after the other

#### Some of the features we are still working on are:

- Drag and drop instances wherever you like them, just like in your desktop
- Export instances to other launchers
- Liteloader support
- Optifine easy-installation support
- Manage your Minecraft skin directly from the launcher
- A lot more...

## 💾 Compilation

These are the steps to compile it yourself.

### ⚙️ Requirements

You need the following software installed:

- [NodeJS](https://nodejs.org/en/download/) (> v14.14.0 x64)
- [Rust](https://www.rust-lang.org/)
- [Python2](https://www.python.org/)(Mac and linux)
- C++ compiler (g++ or windows build tools)

### ▶️ Steps

Install the dependencies and devDependencies.

```sh
$ cd GDLauncher
$ npm i
```

Start the development environment

```sh
$ npm run dev
```

For production environment...

```sh
$ npm run build && npm run start-prod
```

### 🚚 Packaging

To package the app for the local platform:

```sh
$ npm run release
```

## 🚀 Technologies

- [Javascript](https://developer.mozilla.org/bm/docs/Web/JavaScript)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [NodeJS](https://nodejs.org/en/)
- [Electron](https://electronjs.org/)
- [Codacy](https://www.codacy.com/)
- [Webpack](https://webpack.js.org/)
- [Babel](https://babeljs.io/)
- [ESLint](https://eslint.org/)
- [Ant Design](https://ant.design/)
- [Styled Components](https://styled-components.com/)
- [Rust](https://www.rust-lang.org/)

## 🎁 Contributing

You can find a list of unassigned tasks [here](https://github.com/gorilla-devs/GDLauncher/projects). Feel free to ask anything on our discord if you need help or want other tasks.

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## ❤️ Author

- **Davide Ceschia** - _Main Developer_ - [GorillaDevs](https://github.com/gorilla-devs)

See also the list of [contributors](https://github.com/gorilla-devs/GDLauncher/contributors) who participated in this project.

## 📜 History

This project started as a way for me to learn programming and get better at it. I initially developed it in C#.

After a while, I didn't really like the language, so I just started it again from scratch in React and Electron.
It was here that a community started gathering around the project. In the meanwhile, I also found a job where I could learn even more about best practices, data structures, and more.

This is why I decided to rewrite it completely one more time, applying all the knowledge I gained at that time, and that made it possible to implement a lot of really cool features, that were really complicated to code from a technical point of view.

Here you can find the previous versions of the code:

- [Original C# Code](https://www.github.com/gorilla-devs/GDLauncher/tree/csharp_legacy_launcher)
- [First React Version](https://www.github.com/gorilla-devs/GDLauncher/tree/GDLauncher_old)

## 🎓 License

This project is licensed under the GNU GPL V3.0 - see the [LICENSE](LICENSE) file for details.

If you need GDLauncher licensed under different conditions, please contact davide@gdevs.io

You are free to clone the repository and do whatever you want as long as you stick to the license above, just be aware that most of the assets available in the repository are licensed differently (check [COPYING.md](COPYING.md)) so you are not allowed to redistribute those. Also keep in mind that some features will not be working unless you set them up yourself (such as analytics, error tracking..) because the private API keys are stored secretly.

We do not encourage clones of this project (to avoid fragmentation) so don't expect any help from us when trying to do that. We, however, encourage collaboration and growth on this official project and you're more than welcome to contribute.
