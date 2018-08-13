import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { Analytics } from 'jslib/misc';

import {
    CipherService,
    PasswordGenerationService,
    PlatformUtilsService,
} from 'jslib/abstractions';

export default class ContextMenusBackground {
    private contextMenus: any;

    constructor(private main: MainBackground, private cipherService: CipherService,
        private passwordGenerationService: PasswordGenerationService, private analytics: Analytics,
        private platformUtilsService: PlatformUtilsService) {
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
        const password = await this.passwordGenerationService.generatePassword(options);
        this.platformUtilsService.copyToClipboard(password, { window: window });
        this.passwordGenerationService.addHistory(password);

        this.analytics.ga('send', {
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
                this.analytics.ga('send', {
                    hitType: 'event',
                    eventAction: 'Autofilled From Context Menu',
                });
                await this.startAutofillPage(cipher);
            } else if (info.parentMenuItemId === 'copy-username') {
                this.analytics.ga('send', {
                    hitType: 'event',
                    eventAction: 'Copied Username From Context Menu',
                });
                this.platformUtilsService.copyToClipboard(cipher.login.username, { window: window });
            } else if (info.parentMenuItemId === 'copy-password') {
                this.analytics.ga('send', {
                    hitType: 'event',
                    eventAction: 'Copied Password From Context Menu',
                });
                this.platformUtilsService.copyToClipboard(cipher.login.password, { window: window });
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

        BrowserApi.tabSendMessage(tab, {
            command: 'collectPageDetails',
            tab: tab,
            sender: 'contextMenu',
        });
    }
}
