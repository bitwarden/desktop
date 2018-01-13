import * as template from './current.component.html';

import { BrowserApi } from '../../../browser/browserApi';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

import { AutofillService } from '../../../services/abstractions/autofill.service';

import PopupUtilsService from '../services/popupUtils.service';

export class CurrentController {
    i18n: any;
    pageDetails: any = [];
    loaded: boolean = false;
    cardCiphers: any = [];
    identityCiphers: any = [];
    loginCiphers: any = [];
    url: string;
    domain: string;
    canAutofill: boolean = false;
    searchText: string = null;
    inSidebar: boolean = false;
    showPopout: boolean = true;
    disableSearch: boolean = false;

    constructor($scope: any, private cipherService: CipherService, private platformUtilsService: PlatformUtilsService,
        private utilsService: UtilsService, private toastr: any, private $window: ng.IWindowService,
        private $state: any, private $timeout: ng.ITimeoutService, private autofillService: AutofillService,
        private $analytics: any, private i18nService: any, private $filter: ng.IFilterService) {
        this.i18n = i18nService;
        this.inSidebar = PopupUtilsService.inSidebar($window);
        this.showPopout = !this.inSidebar && !platformUtilsService.isSafari();
        this.disableSearch = platformUtilsService.isEdge();

        $scope.$on('syncCompleted', (event: any, successfully: boolean) => {
            if (this.loaded) {
                $timeout(this.loadVault.bind(this), 500);
            }
        });

        $scope.$on('collectPageDetailsResponse', (event: any, details: any) => {
            this.pageDetails.push(details);
        });
    }

    $onInit() {
        this.$timeout(() => {
            document.getElementById('search').focus();
        }, 50);

        this.loadVault();
    }

    refresh() {
        this.loadVault();
    }

    addCipher() {
        this.$state.go('addCipher', {
            animation: 'in-slide-up',
            name: this.domain,
            uri: this.url,
            from: 'current',
        });
    }

    viewCipher(cipher: any) {
        this.$state.go('viewCipher', {
            cipherId: cipher.id,
            animation: 'in-slide-up',
            from: 'current',
        });
    }

    fillCipher(cipher: any) {
        if (!this.canAutofill) {
            this.$analytics.eventTrack('Autofilled Error');
            this.toastr.error(this.i18nService.autofillError);
        }

        this.autofillService.doAutoFill({
            cipher: cipher,
            pageDetails: this.pageDetails,
            fromBackground: false,
        }).then((totpCode: string) => {
            this.$analytics.eventTrack('Autofilled');
            if (totpCode && this.platformUtilsService.isFirefox()) {
                this.utilsService.copyToClipboard(totpCode, document);
            }
            if (PopupUtilsService.inPopup(this.$window)) {
                BrowserApi.closePopup(this.$window);
            }
        }).catch(() => {
            this.$analytics.eventTrack('Autofilled Error');
            this.toastr.error(this.i18nService.autofillError);
        });
    }

    searchVault() {
        this.$state.go('tabs.vault', {
            searchText: this.searchText,
        });
    }

    private loadVault() {
        BrowserApi.getTabFromCurrentWindow().then((tab: any) => {
            if (tab) {
                this.url = tab.url;
            } else {
                this.$timeout(() => {
                    this.loaded = true;
                });
                return;
            }

            this.domain = this.platformUtilsService.getDomain(this.url);

            BrowserApi.tabSendMessage(tab, {
                command: 'collectPageDetails',
                tab: tab,
                sender: 'currentController',
            }).then(() => {
                this.canAutofill = true;
            });

            const otherTypes = [
                CipherType.Card,
                CipherType.Identity,
            ];

            this.cipherService.getAllDecryptedForDomain(this.domain, otherTypes).then((ciphers: any[]) => {
                const loginCiphers: any = [];
                const cardCiphers: any = [];
                const identityCiphers: any = [];

                const sortedCiphers = this.$filter('orderBy')(ciphers,
                    [this.sortUriMatch, this.sortLastUsed, 'name', 'subTitle']);

                sortedCiphers.forEach((cipher: any) => {
                    switch (cipher.type) {
                        case CipherType.Login:
                            loginCiphers.push(cipher);
                            break;
                        case CipherType.Card:
                            cardCiphers.push(cipher);
                            break;
                        case CipherType.Identity:
                            identityCiphers.push(cipher);
                            break;
                        default:
                            break;
                    }
                });

                this.$timeout(() => {
                    this.loginCiphers = loginCiphers;
                    this.cardCiphers = cardCiphers;
                    this.identityCiphers = identityCiphers;
                    this.loaded = true;
                });
            });
        });
    }

    private sortUriMatch(cipher: any) {
        // exact matches should sort earlier.
        return cipher.login && cipher.login.uri && this.url && this.url.startsWith(cipher.login.uri) ? 0 : 1;
    }

    private sortLastUsed(cipher: any) {
        return cipher.localData && cipher.localData.lastUsedDate ? -1 * cipher.localData.lastUsedDate : 0;
    }
}

export const CurrentComponent = {
    bindings: {},
    controller: CurrentController,
    template: template,
};
