import BrowserApi from '../browser/browserApi';

import MainBackground from './main.background';

import CipherService from '../services/cipher.service';
import PasswordGenerationService from '../services/passwordGeneration.service';
import UtilsService from '../services/utils.service';

export default class ContextMenusBackground {
    private contextMenus: any;

    constructor(private main: MainBackground, private cipherService: CipherService,
        private passwordGenerationService: PasswordGenerationService) {
        this.contextMenus = chrome.contextMenus;
    }

    async init() {
        if (!this.contextMenus) {
            return;
        }

        this.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
            if (info.menuItemId === 'generate-password') {
                await this.generatePasswordToClipboard();
            } else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
                info.parentMenuItemId === 'copy-password') {
                await this.cipherAction(info);
            }
        });
    }

    private async generatePasswordToClipboard() {
        const options = await this.passwordGenerationService.getOptions();
        const password = PasswordGenerationService.generatePassword(options);
        UtilsService.copyToClipboard(password);
        this.passwordGenerationService.addHistory(password);

        (window as any).ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Context Menu',
        });
    }

    private async cipherAction(info: any) {
        const id = info.menuItemId.split('_')[1];
        if (id === 'noop') {
            if (chrome.browserAction && chrome.browserAction.openPopup) {
                chrome.browserAction.openPopup();
            }
            return;
        }

        const ciphers = await this.cipherService.getAllDecrypted();
        for (let i = 0; i < ciphers.length; i++) {
            const cipher = ciphers[i];
            if (cipher.id !== id) {
                continue;
            }

            if (info.parentMenuItemId === 'autofill') {
                (window as any).ga('send', {
                    hitType: 'event',
                    eventAction: 'Autofilled From Context Menu',
                });
                await this.startAutofillPage(cipher);
            } else if (info.parentMenuItemId === 'copy-username') {
                (window as any).ga('send', {
                    hitType: 'event',
                    eventAction: 'Copied Username From Context Menu',
                });
                UtilsService.copyToClipboard(cipher.login.username);
            } else if (info.parentMenuItemId === 'copy-password') {
                (window as any).ga('send', {
                    hitType: 'event',
                    eventAction: 'Copied Password From Context Menu',
                });
                UtilsService.copyToClipboard(cipher.login.password);
            }

            break;
        }
    }

    private async startAutofillPage(cipher: any) {
        this.main.loginToAutoFill = cipher;
        const tab = await BrowserApi.getTabFromCurrentWindow();
        if (tab == null) {
            return;
        }

        chrome.tabs.sendMessage(tab.id, {
            command: 'collectPageDetails',
            tab: tab,
            sender: 'contextMenu',
        });
    }
}
