import { ipcRenderer } from 'electron';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { LogService } from 'jslib/abstractions/log.service';
import { Utils } from 'jslib/misc/utils';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha256';

export class NativeMessagingService {
    private publicKey: ArrayBuffer;
    private privateKey: ArrayBuffer;
    private remotePublicKey: ArrayBuffer;

    constructor(private cryptoFunctionService: CryptoFunctionService, private cryptoService: CryptoService,
        private platformUtilService: PlatformUtilsService, private logService: LogService) {
        ipcRenderer.on('nativeMessaging', async (event: any, message: any) => {
            this.messageHandler(message);
        });
    }

    private async messageHandler(rawMessage: any) {
        if (rawMessage.command == 'setupEncryption') {
            this.remotePublicKey = Utils.fromB64ToArray(rawMessage.publicKey).buffer;
            this.secureCommunication();
            return;
        }

        debugger;
        const message = JSON.parse(Utils.fromBufferToUtf8(await this.cryptoFunctionService.rsaDecrypt(rawMessage, this.privateKey, EncryptionAlgorithm)));
        console.log(message);
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
        const encrypted = await this.cryptoFunctionService.rsaEncrypt(Utils.fromUtf8ToArray(JSON.stringify(message)), this.remotePublicKey, EncryptionAlgorithm);

        ipcRenderer.send('nativeMessagingReply', encrypted);
    }

    private async secureCommunication() {
        [this.publicKey, this.privateKey] = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);

        this.send({command: 'setupEncryption', publicKey: Utils.fromBufferToB64(this.publicKey)});
    }
}
