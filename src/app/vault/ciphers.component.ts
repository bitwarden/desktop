import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { CipherView } from 'jslib/models/view/cipherView';

import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {

    @Output() onDeletedCipher = new EventEmitter();
    @Input() collectionId: string = null;

    isReadOnly = false;
    isCozyConnectors = false;

    constructor(searchService: SearchService, protected platformUtilsService: PlatformUtilsService,
        protected i18nService: I18nService, protected cipherService: CipherService,
        protected userService: UserService
    ) {
        super(searchService);
        this.pageSize = 250;
    }

    async deleteCurrentCiphers() {
        if (this.ciphers.length === 0) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('noItemsToDelete'));
            return false;
        }

        const ciphersNumber = this.ciphers.length.toString();
        const title = this.ciphers.length > 1 ?
            (this.deleted ? 'permanentlyDeleteItemsConfirmation' : 'deleteItemsConfirmation') :
            (this.deleted ? 'permanentlyDeleteItemConfirmation'  : 'deleteItemConfirmation' );
        const confirmed = await this.platformUtilsService.showDialog(
            '',
            this.i18nService.t(title).replace('€€€', ciphersNumber),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }
        try {
            await this.deleteCiphers();
            this.onDeletedCipher.emit();
            const notification = this.ciphers.length > 1 ?
                (this.deleted ? 'permanentlyDeletedItems' : 'deletedItems') :
                (this.deleted ? 'permanentlyDeletedItem'  : 'deletedItem' );
            this.platformUtilsService.showToast('success', null,
                this.i18nService.t(notification).replace('€€€', ciphersNumber),
            );
        } catch { }
        return true;
    }

    async restoreCurrentCiphers() {
        if (this.ciphers.length === 0) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('noItemsToRestore'));
            return false;
        }

        const ciphersNumber = this.ciphers.length.toString();
        const title = this.ciphers.length > 1 ? 'restoreItems' : 'restoreItem';
        const confirmed = await this.platformUtilsService.showDialog(
            '',
            this.i18nService.t(title).replace('€€€', ciphersNumber),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }
        try {
            await this.restoreCiphers();
            this.onDeletedCipher.emit(); // the aim is to hide the displayed item from the trash after restoration
            const notification = this.ciphers.length > 1 ? 'restoredItems' : 'restoredItem';
            this.platformUtilsService.showToast('success', null,
                this.i18nService.t(notification).replace('€€€', ciphersNumber));
        } catch { }

        return true;
    }

    // Cozy customization, differentiate shared Ciphers from ciphers in "Cozy Connectors" organization
    // /*
    async load(filter: (cipher: CipherView) => boolean = null, deleted: boolean = false) {
        this.deleted = deleted || false;
        await this.applyFilter(filter);

        for (const cipherView of this.ciphers) {
            // Here we cast cipherView as `any` because overriding original CipherView class from JSLib would be a bit complex
            (cipherView as any).isKonnector = await this.isKonnector(cipherView);
        }

        this.loaded = true;
    }

    protected async isKonnector(cipher: CipherView) {
        const konnectorsOrg = await this.userService.getKonnectorsOrganization();

        if (cipher.organizationId === konnectorsOrg.organizationId) {
            return true;
        }

        return false;
    }
    // */

    protected deleteCiphers() {
        const ids = this.ciphers.map(cipher => cipher.id);

        if (this.deleted) {
            return this.cipherService.deleteManyWithServer(ids);
        } else {
            return this.cipherService.softDeleteManyWithServer(ids);
        }
    }

    protected restoreCiphers() {
        const ids = this.ciphers
            .filter(cipher => cipher.isDeleted)
            .map(cipher => cipher.id);

        return this.cipherService.restoreManyWithServer(ids);
    }
}
