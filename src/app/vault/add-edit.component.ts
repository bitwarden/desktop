import {Component, OnChanges,} from '@angular/core';

import {AuditService} from 'jslib/abstractions/audit.service';
import {AutoTypeService} from 'jslib/abstractions/auto-type.service';
import {CipherService} from 'jslib/abstractions/cipher.service';
import {CollectionService} from 'jslib/abstractions/collection.service';
import {FolderService} from 'jslib/abstractions/folder.service';
import {I18nService} from 'jslib/abstractions/i18n.service';
import {MessagingService} from 'jslib/abstractions/messaging.service';
import {PlatformUtilsService} from 'jslib/abstractions/platformUtils.service';
import {StateService} from 'jslib/abstractions/state.service';
import {UserService} from 'jslib/abstractions/user.service';

import {AddEditComponent as BaseAddEditComponent} from 'jslib/angular/components/add-edit.component';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnChanges {
    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        messagingService: MessagingService, autoTypeService: AutoTypeService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, messagingService, autoTypeService);
    }

    async ngOnInit() {
        // We use ngOnChanges instead.
    }

    async ngOnChanges() {
        await super.init();
        await super.load();
    }
}
