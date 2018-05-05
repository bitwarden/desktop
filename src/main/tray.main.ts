import {
    Menu,
    MenuItem,
    MenuItemConstructorOptions,
    nativeImage,
    Tray,
} from 'electron';
import * as path from 'path';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { ElectronConstants } from 'jslib/electron/electronConstants';
import { WindowMain } from 'jslib/electron/window.main';

export class TrayMain {
    contextMenu: Menu;

    private tray: Tray;
    private icon: string | Electron.NativeImage;
    private pressedIcon: Electron.NativeImage;

    constructor(private windowMain: WindowMain, private i18nService: I18nService,
        private storageService: StorageService, private appName: string) {
        if (process.platform === 'win32') {
            this.icon = path.join(__dirname, '/images/icon.ico');
        } else if (process.platform === 'darwin') {
            const nImage = nativeImage.createFromPath(path.join(__dirname, '/images/icon-template.png'));
            nImage.setTemplateImage(true);
            this.icon = nImage;
            this.pressedIcon = nativeImage.createFromPath(path.join(__dirname, '/images/icon-highlight.png'));
        } else {
            this.icon = path.join(__dirname, '/images/icon.png');
        }
    }

    async init(additionalMenuItems: MenuItemConstructorOptions[] = null) {
        const menuItemOptions: MenuItemConstructorOptions[] = [{
            label: this.appName,
            click: () => this.toggleWindow(),
        },
        { type: 'separator' },
        {
            label: this.i18nService.t('exit'),
            click: () => this.closeWindow(),
        }];

        if (additionalMenuItems != null) {
            menuItemOptions.splice(1, 0, ...additionalMenuItems);
        }

        this.contextMenu = Menu.buildFromTemplate(menuItemOptions);
        if (await this.storageService.get<boolean>(ElectronConstants.enableTrayKey)) {
            this.showTray();
        }

        this.windowMain.win.on('minimize', async (e: Event) => {
            if (await this.storageService.get<boolean>(ElectronConstants.enableMinimizeToTrayKey)) {
                e.preventDefault();
                await this.hideToTray();
            }
        });

        this.windowMain.win.on('show', async (e: Event) => {
            const enableTray = await this.storageService.get<boolean>(ElectronConstants.enableTrayKey);
            if (!enableTray) {
                await this.removeTray(false);
            }
        });
    }

    removeTray(showWindow = true) {
        if (this.tray != null) {
            this.tray.destroy();
            this.tray = null;
        }

        if (this.windowMain.win != null && !this.windowMain.win.isVisible()) {
            this.windowMain.win.show();
        }
    }

    hideToTray() {
        this.showTray();
        if (this.windowMain.win != null) {
            this.windowMain.win.hide();
        }
    }

    showTray() {
        if (this.tray != null) {
            return;
        }

        this.tray = new Tray(this.icon);
        this.tray.setToolTip(this.appName);
        this.tray.on('click', () => this.toggleWindow());

        if (this.pressedIcon != null) {
            this.tray.setPressedImage(this.pressedIcon);
        }
        if (this.contextMenu != null) {
            this.tray.setContextMenu(this.contextMenu);
        }
    }

    private toggleWindow() {
        if (this.windowMain.win == null) {
            return;
        }

        if (this.windowMain.win.isVisible()) {
            this.windowMain.win.hide();
        } else {
            this.windowMain.win.show();
        }
    }

    private closeWindow() {
        if (this.windowMain.win != null) {
            this.windowMain.win.close();
        }
    }
}
