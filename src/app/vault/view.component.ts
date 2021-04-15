import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    NgZone,
    OnChanges,
    Output,
} from '@angular/core';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordRepromptService } from 'jslib/abstractions/passwordReprompt.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';

import { CipherView } from 'jslib/models/view/cipherView';

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
        userService: UserService, eventService: EventService,
        private messagingService: MessagingService, private storageService: StorageService,
        passwordRepromptService: PasswordRepromptService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService,
            passwordRepromptService);
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

    async copy(value: string, typeI18nKey: string, aType: string) {
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
