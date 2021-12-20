import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";

import { isMacAppStore } from "jslib-electron/utils";

import { IMenubarMenu } from "./menubar";

import { MenuItemConstructorOptions } from "electron";

export class FileMenu implements IMenubarMenu {
    readonly id: string = "fileMenu";

    get label(): string {
        return this.localize("file");
    }

    get items(): MenuItemConstructorOptions[] {
        return [
            this.addNewLogin,
            this.addNewItem,
            this.addNewFolder,
            this.separator,
            this.syncVault,
            this.exportVault,
            this.quitBitwarden,
        ];
    }

    private readonly _i18nService: I18nService;
    private readonly _messagingService: MessagingService;
    private readonly _isAuthenticated: boolean;

    constructor(i18nService: I18nService, messagingService: MessagingService, isAuthenticated: boolean) {
        this._i18nService = i18nService;
        this._messagingService = messagingService;
        this._isAuthenticated = isAuthenticated;
    }

    private get addNewLogin(): MenuItemConstructorOptions {
        return {
            label: this.localize("addNewLogin"),
            click: () => this.sendMessage("newLogin"),
            accelerator: "CmdOrCtrl+N",
            id: "addNewLogin",
        };
    }

    private get addNewItem(): MenuItemConstructorOptions {
        return {
            label: this.localize("addNewItem"),
            id: "addNewItem",
            submenu: this.addNewItemSubmenu,
            enabled: this._isAuthenticated,
        };
    }

    private get addNewItemSubmenu(): MenuItemConstructorOptions[] {
        return [
            {
                id: "typeLogin",
                label: this.localize("typeLogin"),
                click: () => this.sendMessage("newLogin"),
                accelerator: "CmdOrCtrl+Shift+L",
            },
            {
                id: "typeCard",
                label: this.localize("typeCard"),
                click: () => this.sendMessage("newCard"),
                accelerator: "CmdOrCtrl+Shift+C",
            },
            {
                id: "typeIdentity",
                label: this.localize("typeIdentity"),
                click: () => this.sendMessage("newIdentity"),
                accelerator: "CmdOrCtrl+Shift+I",
            },
            {
                id: "typeSecureNote",
                label: this.localize("typeSecureNote"),
                click: () => this.sendMessage("newSecureNote"),
                accelerator: "CmdOrCtrl+Shift+S",
            },
        ];
    }

    private get addNewFolder(): MenuItemConstructorOptions {
        return {
            id: "addNewFolder",
            label: this.localize("addNewFolder"),
            click: () => this.sendMessage("newFolder"),
        };
    }

    private get separator(): MenuItemConstructorOptions {
        return { type: "separator" };
    }

    private get syncVault(): MenuItemConstructorOptions {
        return {
            id: "syncVault",
            label: this.localize("syncVault"),
            click: () => this.sendMessage("syncVault"),
        };
    }

    private get exportVault(): MenuItemConstructorOptions {
        return {
            id: "exportVault",
            label: this.localize("exportVault"),
            click: () => this.sendMessage("exportVault"),
        };
    }

    private get quitBitwarden(): MenuItemConstructorOptions {
        return {
            id: "quitBitwarden",
            label: this.localize("quitBitwarden"),
            visible: !isMacAppStore(),
            role: "quit",
        };
    }

    private localize(s: string) {
        return this._i18nService.t(s);
    }

    private sendMessage(message: string) {
        this._messagingService.send(message);
    }
}
