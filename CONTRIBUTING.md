Code contributions are welcome! Please commit any pull requests against the `master` branch.

# Internationalization (i18n)

If you are interested in helping translate the bitwarden browser extension into another language, please follow these steps
when creating your pull request:

1. Create a new folder under `/src/_locales` using the proper Chrome locale code. You can find the locales that Chrome 
   supports here: <https://developer.chrome.com/webstore/i18n?csw=1#localeTable>. For example, if I want to create a new
   translation for German, I will create the folder `/src/_locales/de`.
2. Copy/paste the English `messages.json` file (`/src/_locales/en/messages.json`) into your newly created locales
   folder.
3. Open the `messages.json` for your newly created locale and start translating the `message` JSON properties. The
   `description` properties should be left in English as a reference.
4. Repeat the same process for the store `COPY.md` and `CAPTIONS.md` files in `/store`. Do not copy over the `assets`
   and `screenshots` folders to your new locale. We will update these based on your translations provided in
   `CAPTIONS.md`. Finally, do not translate the titles in the markdown files (ex. `# Name` and `# Screenshot - Sync`).
   These are only for reference.

You can find an example of a proper translation pull request here: <https://github.com/bitwarden/browser/pull/49/files>
