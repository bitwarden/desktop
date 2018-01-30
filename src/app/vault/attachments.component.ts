import * as template from './attachments.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { Angulartics2 } from 'angulartics2';
import { ToasterService } from 'angular2-toaster';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { Cipher } from 'jslib/models/domain/cipher';

import { CipherView } from 'jslib/models/view/cipherView';
import { AttachmentView } from 'jslib/models/view/attachmentView';

@Component({
    selector: 'app-vault-attachments',
    template: template,
})
export class AttachmentsComponent implements OnInit {
    @Input() cipherId: string;

    cipher: CipherView;
    cipherDomain: Cipher;
    hasUpdatedKey: boolean;
    canAccessAttachments: boolean;

    constructor(private cipherService: CipherService, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private cryptoService: CryptoService, private tokenService: TokenService) { }

    async ngOnInit() {
        this.cipherDomain = await this.cipherService.get(this.cipherId);
        this.cipher = await this.cipherDomain.decrypt();

        const key = await this.cryptoService.getEncKey();
        this.hasUpdatedKey = key != null;
        const isPremium = this.tokenService.getPremium();
        this.canAccessAttachments = isPremium || this.cipher.organizationId != null;

        if (!this.canAccessAttachments) {
            alert(this.i18nService.t('premiumRequiredDesc'));
        } else if (!this.hasUpdatedKey) {
            alert(this.i18nService.t('updateKey'));
        }
    }

    async save() {
        if (!this.hasUpdatedKey) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('updateKey'));
            return;
        }

        const fileEl = document.getElementById('file') as HTMLInputElement;
        const files = fileEl.files;
        if (files == null || files.length === 0) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectFile'));
            return;
        }

        if (files[0].size > 104857600) { // 100 MB
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('maxFileSize'));
            return;
        }

        this.cipherDomain = await this.cipherService.saveAttachmentWithServer(this.cipherDomain, files[0]);
        this.cipher = await this.cipherDomain.decrypt();
        this.analytics.eventTrack.next({ action: 'Added Attachment' });
        this.toasterService.popAsync('success', null, this.i18nService.t('attachmentSaved'));

        // reset file input
        // ref: https://stackoverflow.com/a/20552042
        fileEl.type = '';
        fileEl.type = 'file';
        fileEl.value = '';
    }

    async delete(attachment: AttachmentView) {
        if (!confirm(this.i18nService.t('deleteAttachmentConfirmation'))) {
            return;
        }

        await this.cipherService.deleteAttachmentWithServer(this.cipher.id, attachment.id);
        this.analytics.eventTrack.next({ action: 'Deleted Attachment' });
        this.toasterService.popAsync('success', null, this.i18nService.t('deletedAttachment'));
        const i = this.cipher.attachments.indexOf(attachment);
        if (i > -1) {
            this.cipher.attachments.splice(i, 1);
        }
    }
}
