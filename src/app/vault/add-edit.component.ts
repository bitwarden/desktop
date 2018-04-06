import * as template from './add-edit.component.html';

import {
    Component,
    OnChanges,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';

@Component({
    selector: 'app-vault-add-edit',
    template: template,
})
export class AddEditComponent extends BaseAddEditComponent implements OnChanges {
    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        analytics: Angulartics2, toasterService: ToasterService,
        auditService: AuditService) {
        super(cipherService, folderService, i18nService, platformUtilsService, analytics,
            toasterService, auditService);
    }

    async ngOnChanges() {
        await super.load();
    }
}
