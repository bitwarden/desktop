import { powerMonitor } from 'electron';

import { StorageKey } from 'jslib-common/enums/storageKey';

import { isSnapStore } from 'jslib-electron/utils';

import { Main } from '../main';

// tslint:disable-next-line
const IdleLockSeconds = 5 * 60; // 5 minutes
const IdleCheckInterval = 30 * 1000; // 30 seconds

export class PowerMonitorMain {
    private idle: boolean = false;

    constructor(private main: Main) { }

    init() {
        // ref: https://github.com/electron/electron/issues/13767
        if (!isSnapStore()) {
            // System sleep
            powerMonitor.on('suspend', async () => {
                const options = await this.getVaultTimeoutOptions();
                if (options[0] === -3) {
                    options[1] === 'logOut' ? this.main.messagingService.send('logout', { expired: false }) :
                        this.main.messagingService.send('lockVault');
                }
            });
        }

        if (process.platform !== 'linux') {
            // System locked
            powerMonitor.on('lock-screen', async () => {
                const options = await this.getVaultTimeoutOptions();
                if (options[0] === -2) {
                    options[1] === 'logOut' ? this.main.messagingService.send('logout', { expired: false }) :
                        this.main.messagingService.send('lockVault');
                }
            });
        }

        // System idle
        global.setInterval(async () => {
            const idleSeconds: number = powerMonitor.getSystemIdleTime();
            const idle = idleSeconds >= IdleLockSeconds;
            if (idle) {
                if (this.idle) {
                    return;
                }

                const options = await this.getVaultTimeoutOptions();
                if (options[0] === -4) {
                    options[1] === 'logOut' ? this.main.messagingService.send('logout', { expired: false }) :
                        this.main.messagingService.send('lockVault');
                }
            }

            this.idle = idle;
        }, IdleCheckInterval);
    }

    private async getVaultTimeoutOptions(): Promise<[number, string]> {
        const timeout = await this.main.activeAccount.getInformation<number>(StorageKey.VaultTimeout);
        const action = await this.main.activeAccount.getInformation<string>(StorageKey.VaultTimeoutAction);
        return [timeout, action];
    }
}
