import {
    Component,
    NgZone,
    OnDestroy,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import { ipcRenderer } from 'electron';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';

import { Utils } from 'jslib/misc/utils';

import { ElectronConstants } from 'jslib/electron/electronConstants';

const BroadcasterSubscriptionId = 'LockComponent';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent implements OnDestroy {

    private baseUrl: string;

    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        storageService: StorageService, vaultTimeoutService: VaultTimeoutService,
        environmentService: EnvironmentService, stateService: StateService,
        apiService: ApiService, private route: ActivatedRoute,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private syncService: SyncService, private tokenService: TokenService) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService,
            storageService, vaultTimeoutService, environmentService, stateService, apiService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        // @override by Cozy
        // check if code is run into a Cozy app
        // if yes, retrive url and user email
        const cozyDataNode = document.getElementById('cozy-app');
        const cozyDomain = cozyDataNode ? cozyDataNode.dataset.cozyDomain : null;
        if (cozyDomain) {
            this.email = `me@${cozyDomain}`;
            this.baseUrl = `https://${cozyDomain}/`;
            this.environmentService.setUrls({
                base: this.baseUrl + 'bitwarden',
            });
            const vaultUrl = this.environmentService.getWebVaultUrl();
            this.webVaultHostname = Utils.getHostname(vaultUrl);
        }
        const cozyToken = cozyDataNode ? cozyDataNode.dataset.cozyToken : null;
        if (cozyToken) {
            await this.storageService.save('accessToken', cozyToken);
        }
        const cozyKeyHash = cozyDataNode ? cozyDataNode.dataset.cozyKeyHash : null;
        if (cozyKeyHash) {
            await this.storageService.save('keyHash', cozyKeyHash);
        }
        // end Cozy override
        const autoPromptBiometric = !await this.storageService.get<boolean>(ElectronConstants.noAutoPromptBiometrics);

        this.route.queryParams.subscribe(params => {
            if (this.supportsBiometric && params.promptBiometric && autoPromptBiometric) {
                setTimeout(async () => {
                    if (await ipcRenderer.invoke('windowVisible')) {
                        this.unlockBiometric();
                    }
                }, 1000);
            }
        });
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(() => {
                switch (message.command) {
                    case 'windowHidden':
                        this.onWindowHidden();
                        break;
                    default:
                }
            });
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    onWindowHidden() {
        this.showPassword = false;
    }

    /* ************************************************************************************
    @override by Cozy
    We had to override submit() in order to store the userId retrieved in the accessToken.
    The unlock in the normal way doesn't have to do it (since it is an unlock, the userId
    is already known...). We juste imitate what the login process does in
    auth.services.ts .logInHelper() `this.userService.setInformation`
    See :
        * https://github.com/bitwarden/jslib/blob/42348e2fdc6206157d68d8a9f496eaa70520ab01/src/services/auth.service.ts#L335
        * https://github.com/bitwarden/jslib/blob/42348e2fdc6206157d68d8a9f496eaa70520ab01/src/services/user.service.ts#L36
    Original submit() implementation is here :
        * https://github.com/bitwarden/jslib/blob/42348e2fdc6206157d68d8a9f496eaa70520ab01/src/angular/components/lock.component.ts#L63
     */
    async submit() {
        console.log(`lock.submit()`);

        const kdf = await this.userService.getKdf();
        const kdfIterations = await this.userService.getKdfIterations();

        const key = await this.cryptoService.makeKey(this.masterPassword, this.email, kdf, kdfIterations);
        const keyHash = await this.cryptoService.hashPassword(this.masterPassword, key);

        let passwordValid = false;

        if (keyHash != null) {
            const storedKeyHash = await this.cryptoService.getKeyHash();
            if (storedKeyHash != null) {
                passwordValid = storedKeyHash === keyHash;
            } else {
                // should not happen in the case of a Cozy Web App
                // const request = new PasswordVerificationRequest();
                // request.masterPasswordHash = keyHash;
                // try {
                //     this.formPromise = this.apiService.postAccountVerifyPassword(request);
                //     await this.formPromise;
                //     passwordValid = true;
                //     await this.cryptoService.setKeyHash(keyHash);
                // } catch { }
            }
            passwordValid = true;
        }

        if (passwordValid) {
            await this.cryptoService.setKey(key);
            this.setKeyAndContinue2(key);
        } else {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidMasterPassword'));
        }
    }

    private async setKeyAndContinue2(key: SymmetricCryptoKey) {
        await this.cryptoService.setKey(key);
        const userId = this.tokenService.getUserId();
        this.storageService.save('userId', userId),
        this.syncService.fullSync(true);
        this.doContinue2();
    }

    private async doContinue2() {
        this.vaultTimeoutService.biometricLocked = false;
        const disableFavicon = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        await this.stateService.save(ConstantsService.disableFaviconKey, !!disableFavicon);
        this.messagingService.send('unlocked');
        if (this.onSuccessfulSubmit != null) {
            this.onSuccessfulSubmit();
        } else if (this.router != null) {
            this.router.navigate([this.successRoute]);
        }
    }

}
