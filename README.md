[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/desktop?branch=master&svg=true)](https://ci.appveyor.com/project/bitwarden/desktop)
[![travis build](https://travis-ci.org/bitwarden/desktop.svg?branch=master)](https://travis-ci.org/bitwarden/desktop)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/bitwarden-desktop/localized.svg)](https://crowdin.com/project/bitwarden-desktop)
[![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# Bitwarden Desktop Application

[![Platforms](https://imgur.com/SLv9paA.png "Windows, macOS, and Linux")](https://bitwarden.com/download/)

The Bitwarden desktop app is written using Electron and Angular. The application installs on Windows, macOS, and Linux distributions.

![Desktop Vault](https://raw.githubusercontent.com/bitwarden/brand/master/screenshots/desktop-macos-vault.png "My Vault")

# Build/Run

**Requirements**

- [Node.js](https://nodejs.org/)
- Windows users: To compile the native node modules used in the app you will need :
    - the *Visual C++ toolset*,
        - available through the standard Visual Studio installer.
        - and *Windows 10 SDK 17134* as additional dependencies in the Visual Studio installer.
    - to install the *Microsoft Build Tools 2015*
    - if error " impossible to find assembly 'Windows.winmd'" : copy `C:\Program Files (x86)\Windows Kits\10\UnionMetadata\10.0.17134.0\Windows.winmd` in is parent `C:\Program Files (x86)\Windows Kits\10\UnionMetadata\Windows.winmd`


**Run the app**

```bash
npm install
npm run electron
```

**Build the web-app**

```bash
npm install                  #
npm run electron:browser     # to run the web-into electron (hot reload)
npm run build:browser:watch  # to build into `build-browser` and watch changes
npm run build:browser:server # to build and run a server (http://localhost:4242)
npm run build:browser:server:analysebundle # to add a size map of the bundles (on http://127.0.0.1:8888/)
```

**Analyse

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
