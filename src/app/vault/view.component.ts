import {
    Component,
    EventEmitter,
    OnChanges,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault-view',
    templateUrl: 'view.component.html',
})
export class ViewComponent extends BaseViewComponent implements OnChanges {
    @Output() onViewCipherPasswordHistory = new EventEmitter<CipherView>();

    constructor(cipherService: CipherService, totpService: TotpService,
        tokenService: TokenService, toasterService: ToasterService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, analytics: Angulartics2,
        auditService: AuditService) {
        super(cipherService, totpService, tokenService, toasterService, cryptoService, platformUtilsService,
            i18nService, analytics, auditService, window);
    }

    async ngOnChanges() {
        await super.load();
    }

    viewHistory() {
        this.analytics.eventTrack.next({ action: 'View Password History' });
        this.onViewCipherPasswordHistory.emit(this.cipher);
    }
}
