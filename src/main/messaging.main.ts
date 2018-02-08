import { app, ipcMain } from 'electron';
// import { getPassword, setPassword, deletePassword } from 'keytar';

const KeytarService = 'bitwarden';

export class MessagingMain {
    init() {
        ipcMain.on('messagingService', async (event: any, message: any) => {
            switch (message.command) {
                case 'loggedIn':
                    break;
                case 'logout':
                    break;
                case 'syncCompleted':
                    console.log('sync completed!!');
                    break;
                default:
                    break;
            }
        });

        /*
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
            }
            catch {
                event.returnValue = null;
            }
        });
        */
    }
}
