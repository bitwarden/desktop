import * as template from './add.component.html';

import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';
import { FieldType } from 'jslib/enums/fieldType';
import { SecureNoteType } from 'jslib/enums/secureNoteType';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { CardView } from 'jslib/models/view/cardView';
import { CipherView } from 'jslib/models/view/cipherView';
import { FieldView } from 'jslib/models/view/fieldView';
import { FolderView } from 'jslib/models/view/folderView';
import { IdentityView } from 'jslib/models/view/identityView';
import { LoginView } from 'jslib/models/view/loginView';
import { SecureNoteView } from 'jslib/models/view/secureNoteView';

@Component({
    selector: 'app-vault-add',
    template: template,
})
export class AddComponent implements OnChanges {
    @Input() folderId: string;
    cipher: CipherView;
    folders: FolderView[];
    cipherType = CipherType;
    fieldType = FieldType;
    addFieldType: FieldType = FieldType.Text;
    typeOptions: any[];
    cardBrandOptions: any[];
    cardExpMonthOptions: any[];
    identityTitleOptions: any[];
    addFieldTypeOptions: any[];

    constructor(private cipherService: CipherService, private folderService: FolderService,
        private i18nService: I18nService) {
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
    }

    async ngOnChanges() {
        this.cipher = new CipherView();
        this.cipher.folderId = null; // TODO
        this.cipher.type = CipherType.Login;
        this.cipher.login = new LoginView();
        this.cipher.card = new CardView();
        this.cipher.identity = new IdentityView();
        this.cipher.secureNote = new SecureNoteView();
        this.cipher.secureNote.type = SecureNoteType.Generic;

        this.folders = await this.folderService.getAllDecrypted();
    }

    addField() {
        if (this.cipher.fields == null) {
            this.cipher.fields = [];
        }

        const f = new FieldView();
        f.type = this.addFieldType;
        this.cipher.fields.push(f);
    };

    removeField(field: FieldView) {
        const i = this.cipher.fields.indexOf(field);
        if (i > -1) {
            this.cipher.fields.splice(i, 1);
        }
    };
}
