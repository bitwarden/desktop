import * as angular from 'angular';
import { BrowserType } from '../../../enums/browserType.enum';
import { CryptoService } from '../../../services/abstractions/crypto.service';
import { UtilsService } from '../../../services/abstractions/utils.service';
import ConstantsService from '../../../services/constants.service';

import * as template from './settings.component.html';

const RateUrls = {
    [BrowserType.Chrome]:
    'https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb/reviews',
    [BrowserType.Firefox]:
    'https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/#reviews',
    [BrowserType.Opera]:
    'https://addons.opera.com/en/extensions/details/bitwarden-free-password-manager/#feedback-container',
    [BrowserType.Edge]:
    'https://www.microsoft.com/store/p/bitwarden-free-password-manager/9p6kxl0svnnl',
};

class SettingsController {
    lockOption = '';
    i18n: any;
    showOnLocked: boolean;

    constructor(private $state: any, private SweetAlert: any, private utilsService: UtilsService,
                private $analytics: any, private i18nService: any, private constantsService: ConstantsService,
                private cryptoService: CryptoService, private lockService: any, private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            utilsService.initListSectionItemListeners(document, angular);
        }, 500);

        this.showOnLocked = !utilsService.isFirefox() && !utilsService.isEdge();

        chrome.storage.local.get(constantsService.lockOptionKey, (obj: any) => {
            if (obj && (obj[constantsService.lockOptionKey] || obj[constantsService.lockOptionKey] === 0)) {
                let option = obj[constantsService.lockOptionKey].toString();
                if (option === '-2' && !this.showOnLocked) {
                    option = '-1';
                }
                this.lockOption = option;
            } else {
                this.lockOption = '';
            }
        });
    }

    changeLockOption() {
        const obj: any = {};
        obj[this.constantsService.lockOptionKey] = null;
        if (this.lockOption && this.lockOption !== '') {
            obj[this.constantsService.lockOptionKey] = parseInt(this.lockOption, 10);
        }

        chrome.storage.local.set(obj, () => {
            this.cryptoService.getKeyHash().then((keyHash) => {
                if (keyHash) {
                    this.cryptoService.toggleKey();
                } else {
                    this.SweetAlert.swal({
                        title: this.i18nService.loggingOut,
                        text: this.i18nService.loggingOutConfirmation,
                        showCancelButton: true,
                        confirmButtonText: this.i18nService.yes,
                        cancelButtonText: this.i18nService.cancel,
                    }, (confirmed: boolean) => {
                        if (confirmed) {
                            this.cryptoService.toggleKey();
                            chrome.runtime.sendMessage({ command: 'logout' });
                        }
                    });
                }
            });
        });
    }

    lock() {
        this.$analytics.eventTrack('Lock Now');
        this.lockService
            .lock()
            .then(() => {
                return this.$state.go('lock', {
                    animation: 'in-slide-down',
                });
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

    changePassword() {
        this.SweetAlert.swal({
            title: this.i18nService.changeMasterPassword,
            text: this.i18nService.changeMasterPasswordConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            this.$analytics.eventTrack('Clicked Change Password');
            if (confirmed) {
                chrome.tabs.create({ url: 'https://help.bitwarden.com/article/change-your-master-password/' });
            }
        });
    }

    changeEmail() {
        this.SweetAlert.swal({
            title: this.i18nService.changeEmail,
            text: this.i18nService.changeEmailConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            this.$analytics.eventTrack('Clicked Change Email');
            if (confirmed) {
                chrome.tabs.create({ url: 'https://help.bitwarden.com/article/change-your-email/' });
            }
        });
    }

    twoStep() {
        this.SweetAlert.swal({
            title: this.i18nService.twoStepLogin,
            text: this.i18nService.twoStepLoginConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            this.$analytics.eventTrack('Clicked Two-step Login');
            if (confirmed) {
                chrome.tabs.create({ url: 'https://help.bitwarden.com/article/setup-two-step-login/' });
            }
        });
    }

    rate() {
        this.$analytics.eventTrack('Rate Extension');

        chrome.tabs.create({
            url: RateUrls[this.utilsService.getBrowser()],
        });
    }
}

export const SettingsComponent = {
    bindings: {},
    controller: SettingsController,
    template,
};
