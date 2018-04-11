import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { AutofillService } from '../../services/abstractions/autofill.service';

import { PopupUtilsService } from '../services/popup-utils.service';
import { setTimeout } from 'timers';

const BroadcasterSubscriptionId = 'CurrentTabComponent';

@Component({
    selector: 'app-current-tab',
    templateUrl: 'current-tab.component.html',
})
export class CurrentTabComponent implements OnInit, OnDestroy {
    pageDetails: any[] = [];
    cardCiphers: CipherView[];
    identityCiphers: CipherView[];
    loginCiphers: CipherView[];
    url: string;
    domain: string;
    searchText: string;
    canAutofill = false;
    inSidebar = false;
    showPopout = true;
    disableSearch = false;
    loaded = false;
    loadedTimeout: number;

    constructor(private platformUtilsService: PlatformUtilsService, private cipherService: CipherService,
        private popupUtilsService: PopupUtilsService, private autofillService: AutofillService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private router: Router,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef, private syncService: SyncService) {
        this.inSidebar = popupUtilsService.inSidebar(window);
        this.showPopout = !this.inSidebar && !platformUtilsService.isSafari();
        this.disableSearch = platformUtilsService.isEdge();
    }

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        if (this.loaded) {
                            window.setTimeout(() => {
                                this.load();
                            }, 500);
                        }
                        break;
                    case 'collectPageDetailsResponse':
                        if (message.sender === BroadcasterSubscriptionId) {
                            this.pageDetails.push({
                                frameId: message.webExtSender.frameId,
                                tab: message.tab,
                                details: message.details,
                            });
                        }
                        break;
                    case 'syncCompleted':
                        console.log('sync complete : ' + message.successfully);
                        if (message.successfully) {
                            await this.load();
                        }
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            })
        });

        if (!this.syncService.syncInProgress) {
            await this.load();
        } else {
            this.loadedTimeout = window.setTimeout(async () => {
                if (!this.loaded) {
                    await this.load();
                }
            }, 10000);
        }
    }

    ngOnDestroy() {
        window.clearTimeout(this.loadedTimeout);
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async refresh() {
        await this.load();
    }

    addCipher() {
        this.router.navigate(['/add-cipher'], { queryParams: { name: this.domain, uri: this.url } });
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
        this.router.navigate(['/tabs/vault'], { queryParams: { searchText: this.searchText } });
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
            sender: BroadcasterSubscriptionId,
        }).then(() => {
            this.canAutofill = true;
        });

        const ciphers = await this.cipherService.getAllDecryptedForUrl(this.url, [
            CipherType.Card,
            CipherType.Identity,
        ]);

        this.loginCiphers = [];
        this.cardCiphers = [];
        this.identityCiphers = [];

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
