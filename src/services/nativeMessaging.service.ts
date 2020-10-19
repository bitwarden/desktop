import { ipcRenderer } from 'electron';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { LogService } from 'jslib/abstractions/log.service';
import { Utils } from 'jslib/misc/utils';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha1';

export class NativeMessagingService {
    private remotePublicKey: ArrayBuffer;
    private sharedSecret: any;

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

        // TODO: Add error handler, if it fails we should invalidate the key and send a re-authenticate message to browser
        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage, this.sharedSecret));

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

        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message), this.sharedSecret);

        ipcRenderer.send('nativeMessagingReply', encrypted);
    }

    private async secureCommunication() {
        const secret = await this.cryptoFunctionService.randomBytes(64);
        this.sharedSecret = new SymmetricCryptoKey(secret);

        const encryptedSecret = await this.cryptoFunctionService.rsaEncrypt(secret, this.remotePublicKey, EncryptionAlgorithm);
        ipcRenderer.send('nativeMessagingReply', {command: 'setupEncryption', sharedSecret: Utils.fromBufferToB64(encryptedSecret)});
    }
}
