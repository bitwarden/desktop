import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    NgZone,
    OnChanges,
    Output,
} from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { TokenService } from 'jslib-common/abstractions/token.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { ViewComponent as BaseViewComponent } from 'jslib-angular/components/view.component';

import { CipherView } from 'jslib-common/models/view/cipherView';

const BroadcasterSubscriptionId = 'ViewComponent';

@Component({
    selector: 'app-vault-view',
    templateUrl: 'view.component.html',
})
export class ViewComponent extends BaseViewComponent implements OnChanges {
    @Output() onViewCipherPasswordHistory = new EventEmitter<CipherView>();

    constructor(cipherService: CipherService, totpService: TotpService,
        tokenService: TokenService, i18nService: I18nService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, broadcasterService: BroadcasterService,
        ngZone: NgZone, changeDetectorRef: ChangeDetectorRef,
        userService: UserService, eventService: EventService, apiService: ApiService,
        private messagingService: MessagingService, private storageService: StorageService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService, apiService);
    }
    ngOnInit() {
        super.ngOnInit();
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
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
        super.ngOnDestroy();
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async ngOnChanges() {
        await super.load();
    }

    viewHistory() {
        this.onViewCipherPasswordHistory.emit(this.cipher);
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        super.copy(value, typeI18nKey, aType);
        this.messagingService.send('minimizeOnCopy');
    }

    onWindowHidden() {
        this.showPassword = false;
        this.showCardCode = false;
        if (this.cipher !== null && this.cipher.hasFields) {
            this.cipher.fields.forEach(field => {
                field.showValue = false;
            });
        }
    }
}
