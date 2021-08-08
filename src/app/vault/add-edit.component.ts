import {
    Component,
    NgZone,
    OnChanges,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { EventService } from 'jslib/abstractions/event.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { StateService } from 'jslib/abstractions/state.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';

import { CAN_SHARE_ORGANIZATION } from '../../cozy/flags';

const BroadcasterSubscriptionId = 'AddEditComponent';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnChanges, OnDestroy {
    CAN_SHARE_ORGANIZATION = CAN_SHARE_ORGANIZATION;
    @ViewChild('form')
    private form: NgForm;
    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        messagingService: MessagingService, eventService: EventService,
        policyService: PolicyService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, messagingService, eventService, policyService);
    }

    async ngOnInit() {
        // @override by Cozy : remove the notes from the possible types of ciphers
        this.typeOptions.pop();
        // end override
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(() => {
                switch (message.command) {
                    case 'windowHidden':
                        this.onWindowHidden();
                        break;
                    default:
                }
            });
        });
        // We use ngOnChanges for everything else instead.
    }

    async ngOnChanges() {
        await super.init();
        await this.load();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        if (document.querySelectorAll('app-vault-add-edit .ng-dirty').length === 0 ||
            (this.cipher != null && this.cipherId !== this.cipher.id)) {
            this.cipher = null;
        }
        super.load();

        // TODO BJA : add `new folder` in the menu
        // this.folders = this.folders.slice(0);
        // const newFolderItem = new FolderView();
        // newFolderItem.name = '➕ Créer un nouveau répertoire';
        // newFolderItem.id = 'newFolderItem';
        // this.folders.push(newFolderItem);
    }

    onWindowHidden() {
        this.showPassword = false;
        this.showCardCode = false;
        if (this.cipher !== null && this.cipher.hasFields) {
            this.cipher.fields.forEach(field => {
                field.showValue = false;
            });
        }
    }

    allowOwnershipOptions(): boolean {
        return (!this.editMode || this.cloneMode) && this.ownershipOptions
            && (this.ownershipOptions.length > 1 || !this.allowPersonal);
    }

    // TODO BJA : make it work
    // folderChanged(cipher: any, prevValue: any) {
    //     console.log(`folderChanged()`);
    //     console.log(cipher);
    //     console.log(this.folderId, this.cipher.folderId, this.prevFolderIdValue);
    //     if (cipher.folderId === 'newFolderItem') {
    //         console.log("new folder requested => revert to :", this.prevFolderIdValue);
    //         this.cipher.folderId = this.prevFolderIdValue;
    //         cipher.folderId = this.prevFolderIdValue;
    //         this.folderId = this.prevFolderIdValue;
    //         this.onAddFolder.emit();
    //     }
    // }
    // folderFocus(cipher: any) {
    //     console.log(`folderFocus()`);
    //     console.log(cipher);
    //     console.log(this.folderId, this.cipher.folderId, this.prevFolderIdValue);
    //     this.prevFolderIdValue = cipher.folderId
    // }

    markPasswordAsDirty() {
        this.form.controls['Login.Password'].markAsDirty();
    }
}
