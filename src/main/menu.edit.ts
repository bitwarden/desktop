import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";

import { IMenubarMenu } from "./menubar";

import { MenuItemConstructorOptions } from 'electron';

export class EditMenu implements IMenubarMenu {
    private readonly _i18nService: I18nService;
    private readonly _messagingService: MessagingService;
    private readonly _isAuthenticated: boolean;

    readonly id: string = 'editMenu';

    get label(): string {
        return this.localize('edit');
    }

    get items(): Array<MenuItemConstructorOptions> {
        return [
            this.undo,
            this.redo,
            this.separator,
            this.cut,
            this.copy,
            this.paste,
            this.separator,
            this.selectAll,
            this.separator,
            this.copyUsername,
            this.copyPassword,
            this.copyVerificationCodeTotp,
        ];
    }

    constructor(
        i18nService: I18nService,
        messagingService: MessagingService,
        isAuthenticated: boolean,
    ) { 
        this._i18nService = i18nService;
        this._messagingService = messagingService;
        this._isAuthenticated = isAuthenticated;
    }
    
    private get undo(): MenuItemConstructorOptions {
        return {
            id: 'undo',
            label: this.localize('undo'),
            role: 'undo',
        };
    }

    private get redo(): MenuItemConstructorOptions {
        return {
            id: 'redo',
            label: this.localize('redo'),
            role: 'redo',
        };
    }

    private get separator(): MenuItemConstructorOptions {
        return { type: 'separator' };
    }

    private get cut(): MenuItemConstructorOptions {
        return {
            id: 'cut',
            label: this.localize('cut'),
            role: 'cut',
        };
    }

    private get copy(): MenuItemConstructorOptions {
        return {
            id: 'copy',
            label: this.localize('copy'),
            role: 'copy',
        };
    }

    private get paste(): MenuItemConstructorOptions {
        return {
            id: 'paste',
            label: this.localize('paste'),
            role: 'paste',
        };
    }

    private get selectAll(): MenuItemConstructorOptions {
        return {
            id: 'selectAll',
            label: this.localize('selectAll'),
            role: 'selectAll',
        };
    }

    private get copyUsername(): MenuItemConstructorOptions {
        return {
            label: this.localize('copyUsername'),
            id: 'copyUsername',
            click: () => this.sendMessage('copyUsername'),
            accelerator: 'CmdOrCtrl+U',
            enabled: this._isAuthenticated,
        };
    }

    private get copyPassword(): MenuItemConstructorOptions {
        return {
            label: this.localize('copyPassword'),
            id: 'copyPassword',
            click: () => this.sendMessage('copyPassword'),
            accelerator: 'CmdOrCtrl+P',
            enabled: this._isAuthenticated,
        };
    }

    private get copyVerificationCodeTotp(): MenuItemConstructorOptions {
        return {
            label: this.localize('copyVerificationCodeTotp'),
            id: 'copyTotp',
            click: () => this.sendMessage('copyTotp'),
            accelerator: 'CmdOrCtrl+T',
        };
    }

    private localize(s: string) {
        return this._i18nService.t(s);
    }

    private sendMessage(message: string) {
        this._messagingService.send(message);
    }
}
