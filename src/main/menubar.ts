import { AboutMenu } from './menu.about';
import { AccountMenu } from './menu.account';
import { BitwardenMenu } from './menu.bitwarden';
import { EditMenu } from './menu.edit';
import { FileMenu } from './menu.file';
import { HelpMenu } from './menu.help';
import { ViewMenu } from './menu.view';
import { WindowMenu } from './menu.window';

import {
    Menu,
    MenuItemConstructorOptions,
} from 'electron';
import { MenuUpdateRequest } from './menu.updater';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { UpdaterMain } from 'jslib-electron/updater.main';
import { WindowMain } from 'jslib-electron/window.main';

export interface IMenubarMenu {
    id: string;
    label: string;
    visible?: boolean; // Assumes true if null
    items: Array<MenuItemConstructorOptions>;
}

export class Menubar {
    private readonly items: Array<IMenubarMenu>;

    get menu(): Menu {
        const template: Array<MenuItemConstructorOptions> = [];
        if (this.items != null) {
            this.items.forEach((item: IMenubarMenu) => {
                if (item != null) {
                    template.push({
                        id: item.id,
                        label: item.label,
                        submenu: item.items,
                        visible: item.visible ?? true,
                    })
                }
            })
        }
        return Menu.buildFromTemplate(template);
    }

    constructor(
        i18nService: I18nService,
        messagingService: MessagingService,
        updaterMain: UpdaterMain,
        windowMain: WindowMain,
        webVaultUrl: string,
        appVersion: string,
        updateRequest?: MenuUpdateRequest,
    ) {
        this.items = [
            new BitwardenMenu(
                i18nService,
                messagingService,
                updaterMain,
                windowMain.win,
                updateRequest?.accounts
            ),
            new FileMenu(
                i18nService,
                messagingService,
                updateRequest?.accounts[updateRequest?.activeUserId].isLocked,
            ),
            new EditMenu(
                i18nService,
                messagingService,
                updateRequest?.accounts[updateRequest?.activeUserId].isLocked,
            ),
            new ViewMenu(
                i18nService,
                messagingService,
                updateRequest?.accounts[updateRequest?.activeUserId].isLocked,
            ),
            new AccountMenu(
                i18nService,
                messagingService,
                webVaultUrl,
                windowMain.win,
                updateRequest?.accounts[updateRequest?.activeUserId].isLocked,
            ),
            new WindowMenu(
                i18nService,
                messagingService,
                windowMain,
            ),
            new AboutMenu(
                i18nService,
                appVersion,
                windowMain.win,
                updaterMain,
            ),
            new HelpMenu(
                i18nService,
                webVaultUrl,
            ),
        ]
    }
}
