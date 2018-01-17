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

    constructor(private main: MainBackground, private passwordGenerationService: PasswordGenerationService,
        private platformUtilsService: PlatformUtilsService) {
        this.isSafari = this.platformUtilsService.isSafari();
        this.commands = this.isSafari ? safari.application : chrome.commands;
    }

    async init() {
        if (!this.commands) {
            return;
        }

        if (this.isSafari) {
            this.commands.addEventListener('message', async (msgEvent: any) => {
                const msg = msgEvent.message;
                if (msg.command === 'keyboardShortcutTriggered' && msg.command.shortcut) {
                    await this.processCommand(msg.command.shortcut);
                }
            }, false);
        } else {
            this.commands.onCommand.addListener(async (command: any) => {
                await this.processCommand(command);
            });
        }
    }

    private async processCommand(command: string) {
        switch (command) {
            case 'generate_password':
                await this.generatePasswordToClipboard();
                break;
            case 'autofill_login':
                await this.autoFillLogin();
                break;
            case 'open_popup':
                await this.openPopup();
                break;
            default:
                break;
        }
    }

    private async generatePasswordToClipboard() {
        const options = await this.passwordGenerationService.getOptions();
        const password = await this.passwordGenerationService.generatePassword(options);
        UtilsService.copyToClipboard(password);
        this.passwordGenerationService.addHistory(password);

        (window as any).ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Command',
        });
    }

    private async autoFillLogin() {
        const tab = await BrowserApi.getTabFromCurrentWindowId();
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
        if (!this.isSafari || !safari.extension.toolbarItems || !safari.extension.toolbarItems.length) {
            return;
        }

        safari.extension.toolbarItems[0].showPopover();
    }
}
