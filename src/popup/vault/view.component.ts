import { Location } from '@angular/common';
import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';

@Component({
    selector: 'app-vault-view',
    templateUrl: 'view.component.html',
})
export class ViewComponent extends BaseViewComponent implements OnInit {
    showAttachments = true;

    constructor(cipherService: CipherService, totpService: TotpService,
        tokenService: TokenService, toasterService: ToasterService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, analytics: Angulartics2,
        auditService: AuditService, private route: ActivatedRoute,
        private router: Router, private location: Location) {
        super(cipherService, totpService, tokenService, toasterService, cryptoService, platformUtilsService,
            i18nService, analytics, auditService, window);
    }

    ngOnInit() {
        this.showAttachments = !this.platformUtilsService.isEdge();
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            } else {
                this.close();
            }

            await this.load();
        });
    }

    edit() {
        super.edit();
        this.router.navigate(['/edit-cipher'], { queryParams: { cipherId: this.cipher.id } });
    }

    close() {
        this.location.back();
    }
}
