import { ipcRenderer } from 'electron';
import Swal from 'sweetalert2';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { LogService } from 'jslib/abstractions/log.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Utils } from 'jslib/misc/utils';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha1';

export class NativeMessagingService {
    private sharedSecret: any;

    constructor(private cryptoFunctionService: CryptoFunctionService, private cryptoService: CryptoService,
        private platformUtilService: PlatformUtilsService, private logService: LogService, private i18nService: I18nService,
        private userService: UserService, private messagingService: MessagingService) {
        ipcRenderer.on('nativeMessaging', async (event: any, message: any) => {
            this.messageHandler(message);
        });
    }

    private async messageHandler(rawMessage: any) {

        // Request to setup secure encryption
        if (rawMessage.command === 'setupEncryption') {
            const remotePublicKey = Utils.fromB64ToArray(rawMessage.publicKey).buffer;
            const fingerprint = (await this.cryptoService.getFingerprint(await this.userService.getUserId(), remotePublicKey)).join(' ');

            this.messagingService.send('setFocus');

            // Await confirmation that fingerprint is correct
            const submitted = await Swal.fire({
                title: this.i18nService.t('verifyBrowserTitle'),
                html: `${this.i18nService.t('verifyBrowserDescription')}<br><br><strong>${fingerprint}</strong>`,
                showCancelButton: true,
                cancelButtonText: this.i18nService.t('cancel'),
                showConfirmButton: true,
                confirmButtonText: this.i18nService.t('approve'),
                allowOutsideClick: false,
            });

            if (submitted.value !== true) {
                return;
            }

            this.secureCommunication(remotePublicKey);
            return;
        }

        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage, this.sharedSecret));

        // Shared secret is invalidated, force re-authentication
        if (message == null) {
            ipcRenderer.send('nativeMessagingReply', {command: 'invalidateEncryption'});
            return;
        }

        if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
            this.logService.error('NativeMessage is to old, ignoring.');
            return;
        }

        switch (message.command) {
            case 'biometricUnlock':
                if (! this.platformUtilService.supportsBiometric()) {
                    return this.send({command: 'biometricUnlock', response: 'not supported'});
                }

                const response = await this.platformUtilService.authenticateBiometric();
                if (response) {
                    this.send({command: 'biometricUnlock', response: 'unlocked', keyB64: (await this.cryptoService.getKey()).keyB64});
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

    private async secureCommunication(remotePublicKey: ArrayBuffer) {
        const secret = await this.cryptoFunctionService.randomBytes(64);
        this.sharedSecret = new SymmetricCryptoKey(secret);

        const encryptedSecret = await this.cryptoFunctionService.rsaEncrypt(secret, remotePublicKey, EncryptionAlgorithm);
        ipcRenderer.send('nativeMessagingReply', {command: 'setupEncryption', sharedSecret: Utils.fromBufferToB64(encryptedSecret)});
    }
}
