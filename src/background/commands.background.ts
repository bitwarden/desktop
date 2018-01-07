import BrowserApi from '../browser/browserApi';

import MainBackground from './main.background';

import PasswordGenerationService from '../services/passwordGeneration.service';

import { Services } from '@bitwarden/jslib';

export default class CommandsBackground {
    private commands: any;

    constructor(private main: MainBackground, private passwordGenerationService: PasswordGenerationService) {
        this.commands = chrome.commands;
    }

    async init() {
        if (!this.commands) {
            return;
        }

        this.commands.onCommand.addListener(async (command: any) => {
            switch (command) {
                case 'generate_password':
                    await this.generatePasswordToClipboard();
                    break;
                case 'autofill_login':
                    await this.autoFillLogin();
                    break;
                default:
                    break;
            }
        });
    }

    private async generatePasswordToClipboard() {
        const options = await this.passwordGenerationService.getOptions();
        const password = PasswordGenerationService.generatePassword(options);
        Services.UtilsService.copyToClipboard(password);
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
}
