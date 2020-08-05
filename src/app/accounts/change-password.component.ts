import {
    Component,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherString } from 'jslib/models/domain/cipherString';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

import { SetPasswordRequest } from 'jslib/models/request/setPasswordRequest';

import {
    ChangePasswordComponent as BaseChangePasswordComponent,
} from 'jslib/angular/components/change-password.component';

@Component({
    selector: 'app-accounts-change-password',
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent extends BaseChangePasswordComponent {
    onSuccessfulChangePassword: () => Promise<any>;
    successRoute = 'lock';

    constructor(apiService: ApiService, i18nService: I18nService,
        cryptoService: CryptoService, messagingService: MessagingService,
        userService: UserService, passwordGenerationService: PasswordGenerationService,
        platformUtilsService: PlatformUtilsService, folderService: FolderService,
        cipherService: CipherService, syncService: SyncService,
        policyService: PolicyService, router: Router, private route: ActivatedRoute) {
        super(apiService, i18nService, cryptoService, messagingService, userService, passwordGenerationService,
            platformUtilsService, folderService, cipherService, syncService, policyService, router);
    }

    async performSubmitActions(newMasterPasswordHash: string, newKey: SymmetricCryptoKey,
        newEncKey: [SymmetricCryptoKey, CipherString]) {
        const setRequest = new SetPasswordRequest();
        setRequest.newMasterPasswordHash = newMasterPasswordHash;
        setRequest.key = newEncKey[1].encryptedString;

        try {
            this.formPromise = this.apiService.setPassword(setRequest);
            await this.formPromise;

            if (this.onSuccessfulChangePassword != null) {
                this.onSuccessfulChangePassword();
            } else {
                this.router.navigate([this.successRoute]);
            }
        } catch {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('errorOccurred'));
        }
    }
}
