import * as template from './view.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';
import { FieldType } from 'jslib/enums/fieldType';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

import { AttachmentView } from 'jslib/models/view/attachmentView';
import { CipherView } from 'jslib/models/view/cipherView';
import { FieldView } from 'jslib/models/view/fieldView';

@Component({
    selector: 'app-vault-view',
    template: template,
})
export class ViewComponent implements OnChanges, OnDestroy {
    @Input() cipherId: string;
    @Output() onEditCipher = new EventEmitter<string>();
    cipher: CipherView;
    showPassword: boolean;
    isPremium: boolean;
    totpCode: string;
    totpCodeFormatted: string;
    totpDash: number;
    totpSec: number;
    totpLow: boolean;
    fieldType = FieldType;

    private totpInterval: NodeJS.Timer;

    constructor(private cipherService: CipherService, private totpService: TotpService,
        private tokenService: TokenService, private utilsService: UtilsService,
        private cryptoService: CryptoService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService) {
    }

    async ngOnChanges() {
        this.cleanUp();

        const cipher = await this.cipherService.get(this.cipherId);
        this.cipher = await cipher.decrypt();

        this.isPremium = this.tokenService.getPremium();

        if (this.cipher.type == CipherType.Login && this.cipher.login.totp &&
            (cipher.organizationUseTotp || this.isPremium)) {
            await this.totpUpdateCode();
            await this.totpTick();

            this.totpInterval = setInterval(async () => {
                await this.totpTick();
            }, 1000);
        }
    }

    ngOnDestroy() {
        this.cleanUp();
    }

    edit() {
        this.onEditCipher.emit(this.cipher.id);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    toggleFieldValue(field: FieldView) {
        const f = (field as any);
        f.showValue = !f.showValue;
    }

    launch() {
        if (this.cipher.login.uri == null || this.cipher.login.uri.indexOf('://') === -1) {
            return;
        }

        this.platformUtilsService.launchUri(this.cipher.login.uri);
    }

    copy(value: string) {
        if (value == null) {
            return;
        }

        this.utilsService.copyToClipboard(value, window.document);
    }

    async downloadAttachment(attachment: AttachmentView) {
        const a = (attachment as any);
        if (a.downloading) {
            return;
        }

        if (!this.cipher.organizationId && !this.isPremium) {
            this.platformUtilsService.alertError(this.i18nService.t('premiumRequired'),
                this.i18nService.t('premiumRequiredDesc'));
            return;
        }

        a.downloading = true;
        const response = await fetch(new Request(attachment.url, { cache: 'no-cache' }));
        if (response.status !== 200) {
            this.platformUtilsService.alertError(null, this.i18nService.t('errorOccurred'));
            a.downloading = false;
            return;
        }

        try {
            const buf = await response.arrayBuffer();
            const key = await this.cryptoService.getOrgKey(this.cipher.organizationId);
            const decBuf = await this.cryptoService.decryptFromBytes(buf, key);
            this.platformUtilsService.saveFile(window, decBuf, null, attachment.fileName);
        } catch (e) {
            this.platformUtilsService.alertError(null, this.i18nService.t('errorOccurred'));
        }

        a.downloading = false;
    }

    private cleanUp() {
        this.cipher = null;
        this.showPassword = false;
        if (this.totpInterval) {
            clearInterval(this.totpInterval);
        }
    }

    private async totpUpdateCode() {
        if (this.cipher.type !== CipherType.Login || this.cipher.login.totp == null) {
            return;
        }

        this.totpCode = await this.totpService.getCode(this.cipher.login.totp);
        if (this.totpCode != null) {
            this.totpCodeFormatted = this.totpCode.substring(0, 3) + ' ' + this.totpCode.substring(3);
        } else {
            this.totpCodeFormatted = null;
            if (this.totpInterval) {
                clearInterval(this.totpInterval);
            }
        }
    }

    private async totpTick() {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const mod = epoch % 30;

        this.totpSec = 30 - mod;
        this.totpDash = +(Math.round(((2.62 * mod) + 'e+2') as any) + 'e-2');
        this.totpLow = this.totpSec <= 7;
        if (mod === 0) {
            await this.totpUpdateCode();
        }
    }
}
