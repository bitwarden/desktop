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


const BroadcasterSubscriptionId = 'AddEditComponent';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnChanges, OnDestroy {
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
    }

    onWindowHidden() {
        this.showPassword = false;
        this.showCardNumber = false;
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

    markPasswordAsDirty() {
        this.form.controls['Login.Password'].markAsDirty();
    }
}
