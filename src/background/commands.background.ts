import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import {
    PasswordGenerationService,
    PlatformUtilsService,
} from 'jslib/abstractions';

import { UtilsService } from 'jslib/services/utils.service';

export default class CommandsBackground {
    private commands: any;
    private isSafari: boolean;
    private isEdge: boolean;
    private isVivaldi: boolean;

    constructor(private main: MainBackground, private passwordGenerationService: PasswordGenerationService,
        private platformUtilsService: PlatformUtilsService) {
        this.isSafari = this.platformUtilsService.isSafari();
        this.isEdge = this.platformUtilsService.isEdge();
        this.isVivaldi = this.platformUtilsService.isVivaldi();
        this.commands = this.isSafari ? safari.application : chrome.commands;
    }

    async init() {
        if (!this.commands && !this.isEdge) {
            return;
        }

        if (this.isSafari || this.isEdge || this.isVivaldi) {
            BrowserApi.messageListener(async (msg: any, sender: any, sendResponse: any) => {
                if (msg.command === 'keyboardShortcutTriggered' && msg.shortcut) {
                    await this.processCommand(msg.shortcut, sender);
                }
            });
        } else {
            this.commands.onCommand.addListener(async (command: any) => {
                await this.processCommand(command);
            });
        }
    }

    private async processCommand(command: string, sender?: any) {
        switch (command) {
            case 'generate_password':
                await this.generatePasswordToClipboard();
                break;
            case 'autofill_login':
                await this.autoFillLogin(sender ? sender.tab : null);
                break;
            case 'open_popup':
                await this.openPopup();
                break;
            default:
                break;
        }
    }

    private async generatePasswordToClipboard() {
        if (this.isSafari || this.isEdge) {
            // Safari does not support access to clipboard from background
            return;
        }

        const options = await this.passwordGenerationService.getOptions();
        const password = await this.passwordGenerationService.generatePassword(options);
        UtilsService.copyToClipboard(password);
        this.passwordGenerationService.addHistory(password);

        (window as any).ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Command',
        });
    }

    private async autoFillLogin(tab?: any) {
        if (!tab) {
            tab = await BrowserApi.getTabFromCurrentWindowId();
        }

        if (tab == null) {
            return;
        }

        this.main.collectPageDetailsForContentScript(tab, 'autofill_cmd');

        (window as any).ga('send', {
            hitType: 'event',
            eventAction: 'Autofilled From Command',
        });
    }

    private async openPopup() {
        // Chrome APIs cannot open popup
        if (!this.isSafari || !safari.extension.toolbarItems || !safari.extension.toolbarItems.length) {
            return;
        }

        safari.extension.toolbarItems[0].showPopover();

        (window as any).ga('send', {
            hitType: 'event',
            eventAction: 'Opened Popup From Command',
        });
    }
}
