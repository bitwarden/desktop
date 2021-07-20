[![Travis build status shield](https://img.shields.io/travis/com/cozy/cozy-pass-web/master.svg)](https://travis-ci.org/cozy/cozy-pass-web)
[![Github Release version shield](https://img.shields.io/github/tag/cozy/cozy-pass-web.svg)](https://github.com/cozy/cozy-pass-web/releases)

[Cozy] Pass
=======================

What's Cozy?
------------

![Cozy Logo](https://cdn.rawgit.com/cozy/cozy-guidelines/master/templates/cozy_logo_small.svg)

[Cozy] is a platform that brings all your web services in the same private space.  With it, your webapps and your devices can share data easily, providing you with a new experience. You can install Cozy on your own hardware where no one's tracking you.


What's Pass?
------------------

Cozy Pass remembers and synchronises all your passwords for you. By installing the password manager, your digital life will be more secure and simple. Main features are:

- Get your passwords from anywhere
- Log in automatically on your apps and websites
- Your passwords synchronized accross all your devices
- Retrieve your data more easily in your Cozy
- Cozy Pass is secured thanks to Bitwarden technology

![Cozy Pass Vault](https://raw.githubusercontent.com/cozy/cozy-pass-web/master/stores/cozy/screenshots/en/screenshot01.png "My Vault")


Feature requests
------------------

We love getting feedback, do not hesitate if you have any. Please use the [forum](https://forum.cozy.io/) for any feature requests.

Hack
------------------

### Install and run in dev mode

Hacking the Cozy Pass app requires you to [setup a dev environment][setup].

You can then clone the app repository and install dependencies:

```sh
$ git clone https://github.com/cozy/cozy-pass-web.git
$ cd cozy-pass-web
$ npm install
```

:pushpin: If you use a node environment wrapper like [nvm] or [ndenv], don't forget to set your local node version `14` before doing a `npm install`.

:warning: _cozy-pass-web uses [cozy-ui] and [cozy-client], take a look at the ["living on the edge" note](#living-on-the-edge) below to know hot to install and configure the latest available versions.


### Build the web-app

```bash
npm run build:browser:prod   # to build into `build-browser` for production
npm run build:browser:watch  # to build into `build-browser` and watch changes
```

### Living on the edge

[Cozy-ui] is our frontend stack library that provides common styles and components accross the whole Cozy's apps. You can use it for you own application to follow the official Cozy's guidelines and styles. If you need to develop / hack cozy-ui, it's sometimes more useful to develop on it through another app. You can do it by cloning cozy-ui locally and link it to yarn local index:

```sh
git clone https://github.com/cozy/cozy-ui.git
cd cozy-ui
yarn install
yarn link
```

then go back to your app project and replace the distributed cozy-ui module with the linked one:

```sh
cd cozy-pass-web
yarn link cozy-ui
```

You can now run the watch task and your project will hot-reload each times a cozy-ui source file is touched.

[Cozy-client] is our API library that provides an unified API on top of the cozy-stack. If you need to develop / hack cozy-client in parallel of your application, you can use the same trick that we used with [cozy-ui]: yarn linking.

### Open a Pull-Request

If you want to work on Pass and submit code modifications, feel free to open pull-requests! See the [contributing guide][contribute] for more information about how to properly open pull-requests.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`][security] file.


Community
------------------

### Get in touch

You can reach the Cozy Community by:

- Chatting with us on IRC [#cozycloud on Libera.Chat][libera]
- Posting on our [Forum][forum]
- Posting issues on the [Github repos][github]
- Say Hi! on [Twitter][twitter]

License
-------

Cozy Pass is developed by Cozy Cloud and distributed under the [GPL v3 license][gpl-3.0].

[contribute]: https://github.com/cozy/cozy-stack/blob/master/docs/CONTRIBUTING.md
[cozy-client]: https://github.com/cozy/cozy-client
[cozy-ui]: https://github.com/cozy/cozy-ui
[cozy]: https://cozy.io "Cozy Cloud"
[forum]: https://forum.cozy.io/
[github]: https://github.com/cozy/
[gpl-3.0]: LICENSE.txt
[libera]: https://web.libera.chat/#cozycloud
[ndenv]: https://github.com/riywo/ndenv
[nvm]: https://github.com/creationix/nvm
[security]: https://github.com/cozy/cozy-stack/blob/master/docs/security.md
[setup]: https://docs.cozy.io/en/tutorials/app/#install-the-development-environment "Cozy dev docs: Set up the Development Environment"
[twitter]: https://twitter.com/cozycloud