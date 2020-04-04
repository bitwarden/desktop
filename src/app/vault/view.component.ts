import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    NgZone,
    OnChanges,
    Output,
} from '@angular/core';

import { EventType } from 'jslib/enums/eventType';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';

import { CipherView } from 'jslib/models/view/cipherView';

import { ElectronConstants } from 'jslib/electron/electronConstants';

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
        protected messagingService: MessagingService, protected storageService: StorageService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService);
    }

    async ngOnChanges() {
        await super.load();
    }

    viewHistory() {
        this.platformUtilsService.eventTrack('View Password History');
        this.onViewCipherPasswordHistory.emit(this.cipher);
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        super.copy(value, typeI18nKey, aType);
        this.minimizeIfNeeded();
    }

    public async minimizeIfNeeded(): Promise<void> {
        const shouldMinimize =
            await this.storageService.get<boolean>(ElectronConstants.minimizeOnCopyToClipboardKey);
        if (shouldMinimize) {
            this.messagingService.send('minimize');
        }
    }
}
