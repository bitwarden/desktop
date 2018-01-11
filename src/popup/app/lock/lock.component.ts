import * as angular from 'angular';
import * as template from './lock.component.html';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

export class LockController {
    i18n: any;
    masterPassword: string;

    constructor(public $state: any, public i18nService: any, private $timeout: ng.ITimeoutService,
        private platformUtilsService: PlatformUtilsService,
        public cryptoService: CryptoService, public toastr: any, public userService: UserService,
        public messagingService: MessagingService, public SweetAlert: any) {
        this.i18n = i18nService;
    }

    $onInit() {
        this.$timeout(() => {
            this.platformUtilsService.initListSectionItemListeners(document, angular);
            document.getElementById('master-password').focus();
        }, 500);
    }

    logOut() {
        this.SweetAlert.swal({
            title: this.i18nService.logOut,
            text: this.i18nService.logOutConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            if (confirmed) {
                this.messagingService.send('logout');
            }
        });
    }

    async submit() {
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toastr.error(this.i18nService.invalidMasterPassword, this.i18nService.errorsOccurred);
            return;
        }

        const email = await this.userService.getEmail();
        const key = this.cryptoService.makeKey(this.masterPassword, email);
        const keyHash = await this.cryptoService.hashPassword(this.masterPassword, key);
        const storedKeyHash = await this.cryptoService.getKeyHash();

        if (storedKeyHash != null && keyHash != null && storedKeyHash === keyHash) {
            await this.cryptoService.setKey(key);
            this.messagingService.send('unlocked');
            this.$state.go('tabs.current');
        } else {
            this.toastr.error(this.i18nService.invalidMasterPassword, this.i18nService.errorsOccurred);
        }
    }
}

export const LockComponent = {
    bindings: {},
    controller: LockController,
    template: template,
};
