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

import { CipherType } from 'jslib/enums/cipherType';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    canCheckPasswords = true;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        analytics: Angulartics2, toasterService: ToasterService,
        auditService: AuditService, stateService: StateService,
        private route: ActivatedRoute, private router: Router,
        private location: Location) {
        super(cipherService, folderService, i18nService, platformUtilsService, analytics,
            toasterService, auditService, stateService);
    }

    ngOnInit() {
        this.canCheckPasswords = !this.platformUtilsService.isEdge();
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            }
            if (params.folderId) {
                this.folderId = params.folderId;
            }
            if (params.type) {
                const type = parseInt(params.type, null);
                this.type = type;
            }
            this.editMode = !params.cipherId;
            await this.load();

            if (!this.editMode) {
                if (params.name) {
                    this.cipher.name = params.name;
                }
                if (params.uri) {
                    this.cipher.login.uris[0].uri = params.uri;
                }
            }
        });

        window.setTimeout(() => {
            if (!this.editMode) {
                if (this.cipher.name != null && this.cipher.name !== '') {
                    document.getElementById('loginUsername').focus();
                } else {
                    document.getElementById('name').focus();
                }
            }
        }, 200);
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            this.location.back();
            return true;
        }

        return false;
    }

    attachments() {
        super.attachments();
        this.router.navigate(['/attachments'], { queryParams: { cipherId: this.cipher.id } });
    }

    cancel() {
        super.cancel();
        this.location.back();
    }

    async generatePassword(): Promise<boolean> {
        const confirmed = await super.generatePassword();
        if (confirmed) {
            this.stateService.save('addEditCipher', this.cipher);
            this.router.navigate(['generator']);
        }
        return confirmed;
    }

    async delete(): Promise<boolean> {
        const confirmed = await super.delete();
        if (confirmed) {
            this.router.navigate(['/tabs/vault']);
        }
        return confirmed;
    }
}
