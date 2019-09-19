import { remote } from 'electron';
import * as fs from 'fs';

import {
    Component,
    NgZone,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { PremiumComponent as BasePremiumComponent } from 'jslib/angular/components/premium.component';

import { PaymentMethodType } from 'jslib/enums/paymentMethodType';

import { IapCheckRequest } from 'jslib/models/request/iapCheckRequest';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent extends BasePremiumComponent {
    purchasePromise: Promise<any>;
    restorePromise: Promise<any>;
    canMakeMacAppStorePayments = false;
    canRestorePurchase = false;

    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        tokenService: TokenService, apiService: ApiService,
        private ngZone: NgZone, private messagingService: MessagingService,
        private syncService: SyncService) {
        super(i18nService, platformUtilsService, tokenService, apiService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        if (this.isPremium || !this.platformUtilsService.isMacAppStore()) {
            return;
        }
        this.canMakeMacAppStorePayments = remote.inAppPurchase.canMakePayments();
        if (!this.canMakeMacAppStorePayments) {
            return;
        }
        this.setCanRestorePurchase();
        remote.inAppPurchase.on('transactions-updated', (event, transactions) => {
            this.ngZone.run(async () => {
                if (!Array.isArray(transactions)) {
                    return;
                }
                // Check each transaction.
                transactions.forEach(async (transaction) => {
                    const payment = transaction.payment;
                    switch (transaction.transactionState) {
                        case 'purchasing':
                            // tslint:disable-next-line
                            console.log(`Purchasing ${payment.productIdentifier}...`);
                            break;
                        case 'purchased':
                            // tslint:disable-next-line
                            console.log(`${payment.productIdentifier} purchased.`);
                            if (payment.productIdentifier !== 'premium_annually') {
                                return;
                            }
                            await this.makePremium(this.purchasePromise);
                            // Finish the transaction.
                            remote.inAppPurchase.finishTransactionByDate(transaction.transactionDate);
                            break;
                        case 'failed':
                            // tslint:disable-next-line
                            console.log(`Failed to purchase ${payment.productIdentifier}. ` +
                                `${transaction.errorCode} = ${transaction.errorMessage}`);
                            if (transaction.errorCode !== 2) {
                                this.platformUtilsService.showToast('error', null, transaction.errorMessage);
                            }
                            // Finish the transaction.
                            remote.inAppPurchase.finishTransactionByDate(transaction.transactionDate);
                            break;
                        case 'restored':
                            // tslint:disable-next-line
                            console.log(`The purchase of ${payment.productIdentifier} has been restored.`);
                            break;
                        case 'deferred':
                            // tslint:disable-next-line
                            console.log(`The purchase of ${payment.productIdentifier} has been deferred.`);
                            break;
                        default:
                            break;
                    }
                });
            });
        });
    }

    async purchase() {
        if (this.isPremium || !this.canMakeMacAppStorePayments) {
            await super.purchase();
            return;
        }
        try {
            const request = new IapCheckRequest();
            request.paymentMethodType = PaymentMethodType.AppleInApp;
            this.purchasePromise = this.apiService.postIapCheck(request);
            await this.purchasePromise;
            remote.inAppPurchase.purchaseProduct('premium_annually', 1, (isValid) => {
                if (!isValid) {
                    // TODO?
                }
            });
        } catch { }
    }

    async restore() {
        if (this.isPremium || !this.canMakeMacAppStorePayments) {
            return;
        }
        let makePremium = false;
        try {
            const request = new IapCheckRequest();
            request.paymentMethodType = PaymentMethodType.AppleInApp;
            this.restorePromise = this.apiService.postIapCheck(request);
            await this.restorePromise;
            makePremium = true;
        } catch { }
        if (makePremium) {
            await this.makePremium(this.restorePromise);
        }
    }

    private async makePremium(promise: Promise<any>) {
        const receiptUrl = remote.inAppPurchase.getReceiptURL();
        const receiptBuffer = fs.readFileSync(receiptUrl);
        const receiptB64 = Utils.fromBufferToB64(receiptBuffer);
        const fd = new FormData();
        fd.append('paymentMethodType', '6');
        fd.append('paymentToken', receiptB64);
        fd.append('additionalStorageGb', '0');
        try {
            promise = this.apiService.postPremium(fd).then((paymentResponse) => {
                if (paymentResponse.success) {
                    return this.finalizePremium();
                }
            });
            await promise;
        } catch { }
    }

    private async finalizePremium() {
        await this.apiService.refreshIdentityToken();
        await this.syncService.fullSync(true);
        this.platformUtilsService.showToast('success', null, this.i18nService.t('premiumUpdated'));
        this.messagingService.send('purchasedPremium');
        this.isPremium = this.tokenService.getPremium();
        this.setCanRestorePurchase();
    }

    private setCanRestorePurchase() {
        if (!this.isPremium && this.canMakeMacAppStorePayments) {
            const receiptUrl = remote.inAppPurchase.getReceiptURL();
            this.canRestorePurchase = receiptUrl != null;
        } else {
            this.canRestorePurchase = false;
        }
    }
}
