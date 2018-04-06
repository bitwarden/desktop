import {
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { AutofillService } from '../../services/abstractions/autofill.service';

import { PopupUtilsService } from '../services/popup-utils.service';

@Component({
    selector: 'app-current-tab',
    templateUrl: 'current-tab.component.html',
})
export class CurrentTabComponent implements OnInit {
    pageDetails: any[] = [];
    cardCiphers: CipherView[] = [];
    identityCiphers: CipherView[] = [];
    loginCiphers: CipherView[] = [];
    url: string;
    domain: string;
    canAutofill = false;
    searchText: string = null;
    inSidebar = false;
    showPopout = true;
    disableSearch = false;
    loaded = false;

    constructor(private platformUtilsService: PlatformUtilsService, private cipherService: CipherService,
        private popupUtilsService: PopupUtilsService, private autofillService: AutofillService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private router: Router) {
        this.inSidebar = popupUtilsService.inSidebar(window);
        this.showPopout = !this.inSidebar && !platformUtilsService.isSafari();
        this.disableSearch = platformUtilsService.isEdge();
    }

    ngOnInit() {
        this.load();
    }

    async refresh() {
        await this.load();
    }

    addCipher() {
        this.router.navigate(['/add-cipher']);
    }

    viewCipher(cipher: CipherView) {
        this.router.navigate(['/view-cipher'], { queryParams: { cipherId: cipher.id } });
    }

    async fillCipher(cipher: CipherView) {
        if (!this.canAutofill) {
            this.analytics.eventTrack.next({ action: 'Autofilled Error' });
            this.toasterService.popAsync('error', null, this.i18nService.t('autofillError'));
            return;
        }

        try {
            const totpCode = await this.autofillService.doAutoFill({
                cipher: cipher,
                pageDetails: this.pageDetails,
                fromBackground: false,
                doc: window.document,
            });

            this.analytics.eventTrack.next({ action: 'Autofilled' });
            if (totpCode != null && this.platformUtilsService.isFirefox()) {
                this.platformUtilsService.copyToClipboard(totpCode, { doc: window.document });
            }

            if (this.popupUtilsService.inPopup(window)) {
                BrowserApi.closePopup(window);
            }
        } catch {
            this.analytics.eventTrack.next({ action: 'Autofilled Error' });
            this.toasterService.popAsync('error', null, this.i18nService.t('autofillError'));
        }
    }

    searchVault() {

    }

    private async load() {
        const tab = await BrowserApi.getTabFromCurrentWindow();
        if (tab) {
            this.url = tab.url;
        } else {
            this.loaded = true;
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

        const ciphers = await this.cipherService.getAllDecryptedForUrl(this.url, [
            CipherType.Card,
            CipherType.Identity,
        ]);

        ciphers.forEach((c) => {
            switch (c.type) {
                case CipherType.Login:
                    this.loginCiphers.push(c);
                    break;
                case CipherType.Card:
                    this.cardCiphers.push(c);
                    break;
                case CipherType.Identity:
                    this.identityCiphers.push(c);
                    break;
                default:
                    break;
            }
        });

        this.loaded = true;
    }

}
