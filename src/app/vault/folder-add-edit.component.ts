import { Component } from '@angular/core';

import { ApiService } from 'jslib/abstractions';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { OrganizationCreateRequest } from 'jslib/models/request/organizationCreateRequest';

import {
    FolderAddEditComponent as BaseFolderAddEditComponent,
} from 'jslib/angular/components/folder-add-edit.component';

@Component({
    selector: 'app-folder-add-edit',
    templateUrl: 'folder-add-edit.component.html',
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
    constructor(folderService: FolderService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService,
        private apiService: ApiService, private cryptoService: CryptoService,
        private collectionService: CollectionService) {
        super(folderService, i18nService, platformUtilsService);
    }

    async isNameAvailableForCollection(name: string): Promise<boolean> {
        const existingCollections = await this.collectionService.getAllDecrypted();

        const existingNames = existingCollections.map(collection => collection.name);

        return !existingNames.includes(name);
    }

    async submit(): Promise<boolean> {
        if (this.folder.name == null || this.folder.name === '') {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('nameRequired'));
            return false;
        }

        if (!await this.isNameAvailableForCollection(this.folder.name)) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('nameAlreadyExists'));
            return false;
        }

        try {
            const organizationName = this.folder.name;

            const shareKey = await this.cryptoService.makeShareKey();

            const key = shareKey[0].encryptedString;

            const collection = await this.cryptoService.encrypt(organizationName, shareKey[1]);
            const collectionCiphertext = collection.encryptedString;

            await this.apiService.postOrganization({
                name: organizationName,
                collectionName: collectionCiphertext,
                key: key,
            } as OrganizationCreateRequest);

            this.platformUtilsService.showToast('success', null,
                this.i18nService.t(this.editMode ? 'editedFolder' : 'addedFolder'));
            this.onSavedFolder.emit(this.folder);
            return true;
        } catch {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('unexpectedError'));
        }

        return false;
    }
}
