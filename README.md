[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/browser?branch=master&svg=true)] (https://ci.appveyor.com/project/bitwarden/browser)
[![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# bitwarden Browser Extension

<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="http://imgur.com/edRU9B3.png" width="100" height="100"></a> <a href="https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="http://imgur.com/JXP9jir.png" width="100" height="100"></a> <a href="#" target="_blank"><img src="http://imgur.com/YlINxBH.png" width="100" height="100"></a> <a href="https://addons.opera.com/en/extensions/details/bitwarden-free-password-manager/" target="_blank"><img src="http://imgur.com/nSJ9htU.png" width="100" height="100"></a>

The bitwarden browser extension is written using the Chrome Web Extension API and AngularJS.

![Alt text](http://imgur.com/C9p87nk.png "My Vault")

# Build/Run

**Requirements**

- Node.js
- Gulp
- Chrome (preferred), Opera, or Firefox browser

By default the extension is targeting the production API. If you are running the [Core](https://github.com/bitwarden/core) API locally, you'll need to switch the extension to target your local API. Open `src/services/apiService.js` and set `this.baseUrl` to your local API instance (ex. `http://localhost:4000`).

Then run the following commands:

- `gulp build`

You can now load the extension into your browser through the browser's extension tools page:

- Chrome/Opera:
  1. Type `chrome://extensions` in your address bar to bring up the extensions page.
  2. Enable developer mode (checkbox)
  3. Click the "Load unpacked extension" button, navigate to the `src` folder of your local extension instance, and click "Ok".
- Firefox
  1. Type `about:debugging` in your address bar to bring up the add-ons page.
  2. Click the `Load Temporary Add-on` button, navigate to the `src/manifest.json` file, and "Open".

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute
by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature.
