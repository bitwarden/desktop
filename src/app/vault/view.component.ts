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

import { CipherService } from 'jslib/abstractions/cipher.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { CipherView } from 'jslib/models/view/cipherView';

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

    private totpInterval: NodeJS.Timer;

    constructor(private cipherService: CipherService, private totpService: TotpService,
        private tokenService: TokenService) {
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

    launch() {
        // TODO
    }

    copy(value: string) {
        // TODO
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
