import * as template from './lock.component.html';

import { CryptoService } from '../../../services/abstractions/crypto.service';

class LockController {
    i18n: any;
    masterPassword: string;

    constructor(public $state: any, public i18nService: any,
        public cryptoService: CryptoService, public toastr: any, public userService: any,
        public SweetAlert: any) {
        this.i18n = i18nService;
    }

    $onInit() {
        document.getElementById('master-password').focus();
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
                chrome.runtime.sendMessage({ command: 'logout' });
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
            chrome.runtime.sendMessage({ command: 'unlocked' });
            this.$state.go('tabs.current');
        } else {
            this.toastr.error(this.i18nService.invalidMasterPassword, this.i18nService.errorsOccurred);
        }
    }
}

export const LockComponent = {
    bindings: {},
    controller: LockController,
    template,
};
