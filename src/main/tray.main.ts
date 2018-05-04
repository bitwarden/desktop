import { Tray } from 'electron';
import * as Path from 'path';
import { Main } from '../main';
import { DesktopConstantsService } from '../services/desktopconstants.service';

export class TrayMain {
    private tray: Tray;
    private iconPath: string;

    constructor(private main: Main) {
        if (process.platform === 'win32') {
            this.iconPath = Path.join(__dirname, '../resources/icon.ico');
        } else {
            this.iconPath = Path.join(__dirname, '../resources/icon.png');
        }
    }

    init() {
        this.main.windowMain.win.on('minimize', async (event: Event) => {
            if (await this.main.storageService.get<boolean>(DesktopConstantsService.enableHideInTrayKey)) {
                event.preventDefault();
                await this.handleHideEvent();
            }
        });
        this.main.windowMain.win.on('show', async (event: Event) => {
            await this.handleShowEvent();
        });
    }

    private handleShowEvent() {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
        }
    }

    private handleHideEvent() {
        this.tray = new Tray(this.iconPath);
        this.tray.on('click', () => {
            if (this.main.windowMain.win.isVisible()) {
                this.main.windowMain.win.hide();
            } else {
                this.main.windowMain.win.show();
            }
        });
        this.main.windowMain.win.hide();
    }
}
