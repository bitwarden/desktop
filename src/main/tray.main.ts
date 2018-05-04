import {
    NativeImage,
    Tray,
} from 'electron';
import * as path from 'path';

import { WindowMain } from 'jslib/electron/window.main';

import { DesktopConstants } from '../desktopConstants';

export class TrayMain {
    private tray: Tray;
    private icon: string | NativeImage;

    constructor(private windowMain: WindowMain, private appName: string, private minToTray: () => Promise<boolean>) {
        if (process.platform === 'win32') {
            this.icon = path.join(__dirname, '/images/icon.ico');
        } else if (process.platform === 'darwin') {
            const nativeImage = NativeImage.createFromPath(path.join(__dirname, '/images/icon-template.png'));
            nativeImage.setTemplateImage(true);
            this.icon = nativeImage;
        } else {
            this.icon = path.join(__dirname, '/images/icon.png');
        }
    }

    init() {
        this.windowMain.win.on('minimize', async (e: Event) => {
            if (await this.minToTray()) {
                e.preventDefault();
                await this.handleHideEvent();
            }
        });

        this.windowMain.win.on('show', async (e: Event) => {
            await this.handleShowEvent();
        });
    }

    private handleShowEvent() {
        if (this.tray != null) {
            this.tray.destroy();
            this.tray = null;
        }
    }

    private handleHideEvent() {
        this.tray = new Tray(this.icon);
        this.tray.setToolTip(this.appName);

        this.tray.on('click', () => {
            if (this.windowMain.win.isVisible()) {
                this.windowMain.win.hide();
            } else {
                this.windowMain.win.show();
            }
        });

        this.windowMain.win.hide();
    }
}
