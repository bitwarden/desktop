import { ipcRenderer } from 'electron';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { LogService } from 'jslib/abstractions/log.service';

const MessageValidTimeout = 10 * 1000;

export class NativeMessagingService {

    constructor(private cryptoService: CryptoService, private platformUtilService: PlatformUtilsService, private logService: LogService) {
        ipcRenderer.on('nativeMessaging', async (event: any, message: any) => {
            this.messageHandler(message);
        });
    }

    private async messageHandler(rawMessage: any) {
        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage));

        if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
            this.logService.error('NativeMessage is to old, ignoring.');
            return;
        }

        switch (message.command) {
            case 'biometricUnlock':
                if (! this.platformUtilService.supportsBiometric()) {
                    ipcRenderer.send('nativeMessagingSync', )
                    return this.send({command: 'biometricUnlock', response: 'not supported'})
                }

                const response = await this.platformUtilService.authenticateBiometric();
                if (response) {
                    this.send({command: 'biometricUnlock', response: 'unlocked'});
                } else {
                    this.send({command: 'biometricUnlock', response: 'canceled'});
                }

                break;
            default:
                this.logService.error('NativeMessage, got unknown command.');
        }
    }

    private async send(message: any) {
        message.timestamp = Date.now();
        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message));

        ipcRenderer.send('nativeMessagingReply', encrypted);
    }
}
