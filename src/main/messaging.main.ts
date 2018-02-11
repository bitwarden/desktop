import {
    app,
    ipcMain,
} from 'electron';

import {
    deletePassword,
    getPassword,
    setPassword,
} from 'keytar';

import { WindowMain } from './window.main';

const KeytarService = 'Bitwarden';
const SyncInterval = 5 * 60 * 1000; // 5 minutes

export class MessagingMain {
    private syncTimeout: NodeJS.Timer;

    constructor(private windowMain: WindowMain) { }

    init() {
        this.scheduleNextSync();
        ipcMain.on('messagingService', async (event: any, message: any) => this.onMessage(message));

        ipcMain.on('keytar', async (event: any, message: any) => {
            try {
                let val: string = null;
                if (message.action && message.key) {
                    if (message.action === 'getPassword') {
                        val = await getPassword(KeytarService, message.key);
                    } else if (message.action === 'setPassword' && message.value) {
                        await setPassword(KeytarService, message.key, message.value);
                    } else if (message.action === 'deletePassword') {
                        await deletePassword(KeytarService, message.key);
                    }
                }

                event.returnValue = val;
            } catch {
                event.returnValue = null;
            }
        });
    }

    onMessage(message: any) {
        switch (message.command) {
            case 'loggedIn':
                break;
            case 'logout':
                break;
            case 'syncCompleted':
                break;
            case 'scheduleNextSync':
                this.scheduleNextSync();
                break;
            default:
                break;
        }
    }

    private scheduleNextSync() {
        if (this.syncTimeout) {
            global.clearTimeout(this.syncTimeout);
        }

        this.syncTimeout = global.setTimeout(() => {
            this.windowMain.win.webContents.send('messagingService', {
                command: 'checkSyncVault',
            });
        }, SyncInterval);
    }
}
