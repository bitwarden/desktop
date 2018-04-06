import * as template from './add-edit.component.html';

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
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        analytics: Angulartics2, toasterService: ToasterService,
        auditService: AuditService, private route: ActivatedRoute,
        private router: Router, private location: Location) {
        super(cipherService, folderService, i18nService, platformUtilsService, analytics,
            toasterService, auditService);
    }

    ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            }
            this.editMode = !params.cipherId;
            await this.load();
        });
    }

    async submit() {
        if (await super.submit()) {
            this.location.back();
        }
    }

    cancel() {
        super.cancel();
        this.location.back();
    }
}
