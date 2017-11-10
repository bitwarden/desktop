import CryptoService from '../../../services/crypto.service';
import UserService from '../../../services/user.service';

import * as template from './lock.component.html';

class LockController {
    i18n: any;

    constructor(public $scope: any, public $state: any, public i18nService: any,
                public cryptoService: CryptoService, public toastr: any, public userService: UserService,
                public SweetAlert: any, public $timeout: any) {
        this.i18n = i18nService;

        $timeout(() => {
            document.getElementById('master-password').focus();
        });
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
        const email = await this.userService.getEmail();
        const key = this.cryptoService.makeKey(this.$scope.masterPassword, email);
        const keyHash = await this.cryptoService.hashPassword(this.$scope.masterPassword, key);
        const storedKeyHash = await this.cryptoService.getKeyHash();

        if (storedKeyHash && keyHash && storedKeyHash === keyHash) {
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
