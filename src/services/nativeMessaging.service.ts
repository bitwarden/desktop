import { ipcRenderer } from 'electron';
import Swal from 'sweetalert2';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { StorageService } from 'jslib-common/abstractions';
import { Utils } from 'jslib-common/misc/utils';
import { SymmetricCryptoKey } from 'jslib-common/models/domain/symmetricCryptoKey';
import { ElectronConstants } from 'jslib-electron/electronConstants';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha1';

export class NativeMessagingService {
    private sharedSecrets = new Map<string, SymmetricCryptoKey>();

    constructor(private cryptoFunctionService: CryptoFunctionService, private cryptoService: CryptoService,
        private platformUtilService: PlatformUtilsService, private logService: LogService,
        private i18nService: I18nService, private userService: UserService, private messagingService: MessagingService,
        private vaultTimeoutService: VaultTimeoutService, private storageService: StorageService) {
        ipcRenderer.on('nativeMessaging', async (event: any, message: any) => {
            this.messageHandler(message);
        });
    }

    private async messageHandler(msg: any) {
        const appId = msg.appId;
        const rawMessage = msg.message;

        // Request to setup secure encryption
        if (rawMessage.command === 'setupEncryption') {
            const remotePublicKey = Utils.fromB64ToArray(rawMessage.publicKey).buffer;

            // Valudate the UserId to ensure we are logged into the same account.
            if (rawMessage.userId !== await this.userService.getUserId()) {
                ipcRenderer.send('nativeMessagingReply', {command: 'wrongUserId', appId: appId});
                return;
            }

            if (await this.storageService.get<boolean>(ElectronConstants.enableBrowserIntegrationFingerprint)) {
                ipcRenderer.send('nativeMessagingReply', {command: 'verifyFingerprint', appId: appId});

                const fingerprint = (await this.cryptoService.getFingerprint(await this.userService.getUserId(), remotePublicKey)).join(' ');

                this.messagingService.send('setFocus');

                // Await confirmation that fingerprint is correct
                const submitted = await Swal.fire({
                    titleText: this.i18nService.t('verifyBrowserTitle'),
                    html: `${this.i18nService.t('verifyBrowserDesc')}<br><br><strong>${fingerprint}</strong>`,
                    showCancelButton: true,
                    cancelButtonText: this.i18nService.t('cancel'),
                    showConfirmButton: true,
                    confirmButtonText: this.i18nService.t('approve'),
                    allowOutsideClick: false,
                });

                if (submitted.value !== true) {
                    return;
                }
            }

            this.secureCommunication(remotePublicKey, appId);
            return;
        }

        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage, this.sharedSecrets.get(appId)));

        // Shared secret is invalidated, force re-authentication
        if (message == null) {
            ipcRenderer.send('nativeMessagingReply', {command: 'invalidateEncryption', appId: appId});
            return;
        }

        if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
            this.logService.error('NativeMessage is to old, ignoring.');
            return;
        }

        switch (message.command) {
            case 'biometricUnlock':
                if (! this.platformUtilService.supportsBiometric()) {
                    return this.send({command: 'biometricUnlock', response: 'not supported'}, appId);
                }

                if (! await this.vaultTimeoutService.isBiometricLockSet()) {
                    this.send({command: 'biometricUnlock', response: 'not enabled'}, appId);

                    return await Swal.fire({
                        title: this.i18nService.t('biometricsNotEnabledTitle'),
                        text: this.i18nService.t('biometricsNotEnabledDesc'),
                        showCancelButton: true,
                        cancelButtonText: this.i18nService.t('cancel'),
                        showConfirmButton: false,
                    });
                }

                const keyB64 = await (await this.cryptoService.getKey('biometric')).keyB64;

                if (keyB64 != null) {
                    this.send({ command: 'biometricUnlock', response: 'unlocked', keyB64: keyB64 }, appId);
                } else {
                    this.send({ command: 'biometricUnlock', response: 'canceled' }, appId);
                }

                break;
            default:
                this.logService.error('NativeMessage, got unknown command.');
        }
    }

    private async send(message: any, appId: string) {
        message.timestamp = Date.now();

        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message), this.sharedSecrets.get(appId));

        ipcRenderer.send('nativeMessagingReply', {appId: appId, message: encrypted});
    }

    private async secureCommunication(remotePublicKey: ArrayBuffer, appId: string) {
        const secret = await this.cryptoFunctionService.randomBytes(64);
        this.sharedSecrets.set(appId, new SymmetricCryptoKey(secret));

        const encryptedSecret = await this.cryptoFunctionService.rsaEncrypt(secret, remotePublicKey, EncryptionAlgorithm);
        ipcRenderer.send('nativeMessagingReply', {appId: appId, command: 'setupEncryption', sharedSecret: Utils.fromBufferToB64(encryptedSecret)});
    }
}
