[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/browser?branch=master&svg=true)](https://ci.appveyor.com/project/bitwarden/browser)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/bitwarden-browser/localized.svg)](https://crowdin.com/project/bitwarden-browser)
[![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# bitwarden Browser Extension

<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/3C4iKO0.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="http://imgur.com/JXP9jir.png" width="64" height="64"></a>
<a href="https://www.microsoft.com/store/p/bitwarden-free-password-manager/9p6kxl0svnnl" target="_blank"><img src="https://imgur.com/RlmwPGO.png" width="64" height="64"></a>
<a href="https://addons.opera.com/extensions/details/bitwarden-free-password-manager/" target="_blank"><img src="http://imgur.com/nSJ9htU.png" width="64" height="64"></a>
<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/j8qsZ5q.png" width="64" height="64"></a>
<a href="https://brave.com/" target="_blank"><img src="https://imgur.com/bWzsEN8.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="https://imgur.com/uhb8M86.png" width="64" height="64"></a>

The bitwarden browser extension is written using the Chrome Web Extension API and AngularJS.

![Alt text](http://imgur.com/C9p87nk.png "My Vault")

# Build/Run

**Requirements**

- [Node.js](https://nodejs.org/en/)
- [Gulp](http://gulpjs.com/) (`npm install --global gulp-cli`)
- Chrome (preferred), Opera, or Firefox browser

By default the extension is targeting the production API. If you are running the [Core](https://github.com/bitwarden/core) API locally, you'll need to switch the extension to target your local instance. Open `src/services/apiService.js` and set `self.baseUrl` and `self.identityBaseUrl` to your local API instance (ex. `http://localhost:5000`).

Then run the following commands:
```bash
npm install
npm run dev:watch
```

You can now load the extension into your browser through the browser's extension tools page:

- Chrome/Opera:
  1. Type `chrome://extensions` in your address bar to bring up the extensions page.
  2. Enable developer mode (checkbox)
  3. Click the "Load unpacked extension" button, navigate to the `dist` folder of your local extension instance, and click "Ok".
- Firefox
  1. Type `about:debugging` in your address bar to bring up the add-ons page.
  2. Click the `Load Temporary Add-on` button, navigate to the `dist/manifest.json` file, and "Open".

### Release

To build the the extension for production the following commands should be run:

```bash
npm run prod
gulp dist:[browser]
```

Where `[browser]` is the web browser to target. Currently the following web browsers are supported: `chrome`, `edge`, `firefox` and `opera`. 

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
