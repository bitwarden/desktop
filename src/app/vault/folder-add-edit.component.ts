import { Component } from '@angular/core';

import { ApiService } from 'jslib/abstractions';
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
        private apiService: ApiService, private cryptoService: CryptoService) {
        super(folderService, i18nService, platformUtilsService);
    }

    async submit(): Promise<boolean> {
        if (this.folder.name == null || this.folder.name === '') {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('nameRequired'));
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
        } catch { }

        return false;
    }
}
