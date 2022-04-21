[![Github Workflow build on master](https://github.com/bitwarden/desktop/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/bitwarden/desktop/actions/workflows/build.yml?query=branch:master)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/bitwarden-desktop/localized.svg)](https://crowdin.com/project/bitwarden-desktop)
[![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

> **Note! Re-organization in progress**
>
> We are currently re-organizing some our the client repositories. During this transition period we might not have time to address any new Pull Requests, and may require that you re-open a new Pull Request afterwards instead.

# Bitwarden Desktop Application


[![Platforms](https://imgur.com/SLv9paA.png "Windows, macOS, and Linux")](https://bitwarden.com/download/)

The Bitwarden desktop app is written using Electron and Angular. The application installs on Windows, macOS, and Linux distributions.

![Desktop Vault](https://github.com/bitwarden/brand/blob/f09f2fa594c8a020c315296074f18ce0a7b3f171/screenshots/desktop-macos-vault.png "My Vault")

# Build/Run

## Requirements

- [Node.js](https://nodejs.org) v16.13.1 (LTS) or greater
- NPM v8
- Rust (https://www.rust-lang.org/tools/install)
- Windows:
  - To compile the native node modules used in the app you will need the _Visual C++ toolset_, available through the standard Visual Studio installer. You will also need to install the _Microsoft Build Tools 2015_ and _Windows 10 SDK 17134_ as additional dependencies in the Visual Studio installer.
- Linux:
  - The following packages `build-essential libsecret-1-dev libglib2.0-dev`

## Build native module

The desktop application relies on native code written in rust, which needs to be compiled first.

```bash
cd desktop_native
npm ci
npm run build
```

## Run the app

```bash
npm ci
npm run electron
```

### Debug Native Messaging

Native Messaging (communication with the browser extension) works by having the browser start a lightweight proxy application baked into our desktop binary. To setup an environment which allows
for easy debugging you will need to build the application for distribution, i.e. `npm run dist:<platform>`, start the dist version and enable desktop integration. This will write some manifests
to disk, Consult the [native manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Manifest_location) documentation for more details of the manifest
format, and the exact locations for the different platforms. _Note_ that disabling the desktop integration will delete the manifests, and the files will need to be updated again.

The generated manifests are pre-configured with the production ID for the browser extensions. In order to use them with the development builds, the browser extension ID of the development build
needs to be added to the `allowed_extensions` section of the manifest. These IDs are generated by the browser, and can be found in the extension settings within the browser.

It will then be possible to run the desktop application as usual using `npm run electron` and communicate with the browser.

# We're Hiring!

Interested in contributing in a big way? Consider joining our team! We're hiring for many positions. Please take a look at our [Careers page](https://bitwarden.com/careers/) to see what opportunities are currently open as well as what it's like to work at Bitwarden.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.

## Prettier

We recently migrated to using Prettier as code formatter. All previous branches will need to updated to avoid large merge conflicts using the following steps:

1. Check out your local Branch
2. Run `git merge b4df834b16d4f5d4162a926a5a308bdb3ebc718b`
3. Resolve any merge conflicts, commit.
4. Run `npm run prettier`
5. Commit
6. Run `git merge -Xours 521feae535d83166e620c3c28dfc3e7b0314a00e`
7. Push

### Git blame

We also recommend that you configure git to ignore the prettier revision using:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
