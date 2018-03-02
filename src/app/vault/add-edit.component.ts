import * as template from './add-edit.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherType } from 'jslib/enums/cipherType';
import { FieldType } from 'jslib/enums/fieldType';
import { SecureNoteType } from 'jslib/enums/secureNoteType';
import { UriMatchType } from 'jslib/enums/uriMatchType';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CardView } from 'jslib/models/view/cardView';
import { CipherView } from 'jslib/models/view/cipherView';
import { FieldView } from 'jslib/models/view/fieldView';
import { FolderView } from 'jslib/models/view/folderView';
import { IdentityView } from 'jslib/models/view/identityView';
import { LoginUriView } from 'jslib/models/view/loginUriView';
import { LoginView } from 'jslib/models/view/loginView';
import { SecureNoteView } from 'jslib/models/view/secureNoteView';

@Component({
    selector: 'app-vault-add-edit',
    template: template,
})
export class AddEditComponent implements OnChanges {
    @Input() folderId: string;
    @Input() cipherId: string;
    @Input() type: CipherType;
    @Output() onSavedCipher = new EventEmitter<CipherView>();
    @Output() onDeletedCipher = new EventEmitter<CipherView>();
    @Output() onCancelled = new EventEmitter<CipherView>();
    @Output() onEditAttachments = new EventEmitter<CipherView>();
    @Output() onGeneratePassword = new EventEmitter();

    editMode: boolean = false;
    cipher: CipherView;
    folders: FolderView[];
    title: string;
    formPromise: Promise<any>;
    deletePromise: Promise<any>;
    checkPasswordPromise: Promise<number>;
    showPassword: boolean = false;
    cipherType = CipherType;
    fieldType = FieldType;
    addFieldType: FieldType = FieldType.Text;
    typeOptions: any[];
    cardBrandOptions: any[];
    cardExpMonthOptions: any[];
    identityTitleOptions: any[];
    addFieldTypeOptions: any[];
    uriMatchOptions: any[];

    constructor(private cipherService: CipherService, private folderService: FolderService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private auditService: AuditService) {
        this.typeOptions = [
            { name: i18nService.t('typeLogin'), value: CipherType.Login },
            { name: i18nService.t('typeCard'), value: CipherType.Card },
            { name: i18nService.t('typeIdentity'), value: CipherType.Identity },
            { name: i18nService.t('typeSecureNote'), value: CipherType.SecureNote },
        ];
        this.cardBrandOptions = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
            { name: 'Visa', value: 'Visa' },
            { name: 'Mastercard', value: 'Mastercard' },
            { name: 'American Express', value: 'Amex' },
            { name: 'Discover', value: 'Discover' },
            { name: 'Diners Club', value: 'Diners Club' },
            { name: 'JCB', value: 'JCB' },
            { name: 'Maestro', value: 'Maestro' },
            { name: 'UnionPay', value: 'UnionPay' },
            { name: i18nService.t('other'), value: 'Other' },
        ];
        this.cardExpMonthOptions = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
            { name: '01 - ' + i18nService.t('january'), value: '1' },
            { name: '02 - ' + i18nService.t('february'), value: '2' },
            { name: '03 - ' + i18nService.t('march'), value: '3' },
            { name: '04 - ' + i18nService.t('april'), value: '4' },
            { name: '05 - ' + i18nService.t('may'), value: '5' },
            { name: '06 - ' + i18nService.t('june'), value: '6' },
            { name: '07 - ' + i18nService.t('july'), value: '7' },
            { name: '08 - ' + i18nService.t('august'), value: '8' },
            { name: '09 - ' + i18nService.t('september'), value: '9' },
            { name: '10 - ' + i18nService.t('october'), value: '10' },
            { name: '11 - ' + i18nService.t('november'), value: '11' },
            { name: '12 - ' + i18nService.t('december'), value: '12' },
        ];
        this.identityTitleOptions = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
            { name: i18nService.t('mr'), value: i18nService.t('mr') },
            { name: i18nService.t('mrs'), value: i18nService.t('mrs') },
            { name: i18nService.t('ms'), value: i18nService.t('ms') },
            { name: i18nService.t('dr'), value: i18nService.t('dr') },
        ];
        this.addFieldTypeOptions = [
            { name: i18nService.t('cfTypeText'), value: FieldType.Text },
            { name: i18nService.t('cfTypeHidden'), value: FieldType.Hidden },
            { name: i18nService.t('cfTypeBoolean'), value: FieldType.Boolean },
        ];
        this.uriMatchOptions = [
            { name: i18nService.t('defaultAutofillDetection'), value: null },
            { name: i18nService.t('baseDomain'), value: UriMatchType.BaseDomain },
            { name: i18nService.t('fullHostname'), value: UriMatchType.FullHostname },
            { name: i18nService.t('startsWith'), value: UriMatchType.StartsWith },
            { name: i18nService.t('regEx'), value: UriMatchType.RegularExpression },
            { name: i18nService.t('exact'), value: UriMatchType.Exact },
            { name: i18nService.t('never'), value: UriMatchType.Never },
        ];
    }

    async ngOnChanges() {
        this.editMode = this.cipherId != null;

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editItem');
            const cipher = await this.cipherService.get(this.cipherId);
            this.cipher = await cipher.decrypt();
        } else {
            this.title = this.i18nService.t('addItem');
            this.cipher = new CipherView();
            this.cipher.folderId = this.folderId;
            this.cipher.type = this.type == null ? CipherType.Login : this.type;
            this.cipher.login = new LoginView();
            this.cipher.login.uris = [new LoginUriView()];
            this.cipher.card = new CardView();
            this.cipher.identity = new IdentityView();
            this.cipher.secureNote = new SecureNoteView();
            this.cipher.secureNote.type = SecureNoteType.Generic;
        }

        this.folders = await this.folderService.getAllDecrypted();
    }

    async submit() {
        if (this.cipher.name == null || this.cipher.name === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('nameRequired'));
            return;
        }

        const cipher = await this.cipherService.encrypt(this.cipher);

        try {
            this.formPromise = this.cipherService.saveWithServer(cipher);
            await this.formPromise;
            this.cipher.id = cipher.id;
            this.analytics.eventTrack.next({ action: this.editMode ? 'Edited Cipher' : 'Added Cipher' });
            this.toasterService.popAsync('success', null,
                this.i18nService.t(this.editMode ? 'editedItem' : 'addedItem'));
            this.onSavedCipher.emit(this.cipher);
        } catch { }
    }

    addUri() {
        if (this.cipher.type !== CipherType.Login) {
            return;
        }

        if (this.cipher.login.uris == null) {
            this.cipher.login.uris = [];
        }

        this.cipher.login.uris.push(new LoginUriView());
    }

    removeUri(uri: LoginUriView) {
        if (this.cipher.type !== CipherType.Login || this.cipher.login.uris == null) {
            return;
        }

        const i = this.cipher.login.uris.indexOf(uri);
        if (i > -1) {
            this.cipher.login.uris.splice(i, 1);
        }
    }

    addField() {
        if (this.cipher.fields == null) {
            this.cipher.fields = [];
        }

        const f = new FieldView();
        f.type = this.addFieldType;
        this.cipher.fields.push(f);
    }

    removeField(field: FieldView) {
        const i = this.cipher.fields.indexOf(field);
        if (i > -1) {
            this.cipher.fields.splice(i, 1);
        }
    }

    cancel() {
        this.onCancelled.emit(this.cipher);
    }

    attachments() {
        this.onEditAttachments.emit(this.cipher);
    }

    async delete() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteItemConfirmation'), this.i18nService.t('deleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            this.deletePromise = this.cipherService.deleteWithServer(this.cipher.id);
            await this.deletePromise;
            this.analytics.eventTrack.next({ action: 'Deleted Cipher' });
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedItem'));
            this.onDeletedCipher.emit(this.cipher);
        } catch { }
    }

    async generatePassword() {
        if (this.cipher.login != null && this.cipher.login.password != null && this.cipher.login.password.length) {
            const confirmed = await this.platformUtilsService.showDialog(
                this.i18nService.t('overwritePasswordConfirmation'), this.i18nService.t('overwritePassword'),
                this.i18nService.t('yes'), this.i18nService.t('no'));
            if (!confirmed) {
                return;
            }
        }

        this.onGeneratePassword.emit();
    }

    togglePassword() {
        this.analytics.eventTrack.next({ action: 'Toggled Password on Edit' });
        this.showPassword = !this.showPassword;
        document.getElementById('loginPassword').focus();
    }

    toggleFieldValue(field: FieldView) {
        const f = (field as any);
        f.showValue = !f.showValue;
    }

    toggleUriOptions(uri: LoginUriView) {
        const u = (uri as any);
        u.showOptions = u.showOptions == null && uri.match != null ? false : !u.showOptions;
    }

    async checkPassword() {
        if (this.cipher.login == null || this.cipher.login.password == null || this.cipher.login.password === '') {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Check Password' });
        this.checkPasswordPromise = this.auditService.passwordLeaked(this.cipher.login.password);
        const matches = await this.checkPasswordPromise;

        if (matches > 0) {
            this.toasterService.popAsync('warning', null, this.i18nService.t('passwordExposed', matches.toString()));
        } else {
            this.toasterService.popAsync('success', null, this.i18nService.t('passwordSafe'));
        }
    }
}
