import { Component } from '@angular/core';

import { CipherService } from '../../services/cipher.service';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { ShareComponent as BaseShareComponent } from 'jslib/angular/components/share.component';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent extends BaseShareComponent {
    selectedCollectionId: string = undefined;

    constructor(private localCipherService: CipherService, i18nService: I18nService,
        collectionService: CollectionService, userService: UserService,
        platformUtilsService: PlatformUtilsService) {
        super(collectionService, platformUtilsService, i18nService, userService, localCipherService);
    }

    filterCollections() {
        this.writeableCollections.forEach(c => (c as any).checked = false);

        const organizationIds = this.organizations.map(organization => organization.id);

        this.collections = this.writeableCollections
            .filter(collection => organizationIds.includes(collection.organizationId));
    }

    onSelectedCollectionChange() {
        this.collections.forEach(collection => {
            (collection as any).checked = this.selectedCollectionId === collection.id;
        });
    }

    async load() {
        await super.load();

        if (this.cipher.organizationId) {
            this.selectedCollectionId = this.collections.find(col => col.organizationId === this.cipher.organizationId)?.id;
        }
    }

    async submit(): Promise<boolean> {
        const isCipherInOrganization = !!this.cipher.organizationId;

        const selectedCollection = this.collections
            .filter(c => !!(c as any).checked);

        if (isCipherInOrganization && selectedCollection.length === 0) {
            return await this.unshare();
        } else if (!isCipherInOrganization && selectedCollection.length !== 1) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectOneFolder'));
            return;
        }

        const selectedCollectionIds = selectedCollection.map(c => c.id);

        const organizationId = selectedCollection[0].organizationId;

        const cipherDomain = await this.cipherService.get(this.cipherId);
        const cipherView = await cipherDomain.decrypt();

        try {
            this.formPromise = this.cipherService.shareWithServer(cipherView, organizationId,
                selectedCollectionIds).then(async () => {
                    this.onSharedCipher.emit();
                    this.platformUtilsService.showToast('success', null, this.i18nService.t('sharedItem'));
                });
            await this.formPromise;
            return true;
        } catch { }
        return false;
    }

    get canSave() {
        const isCipherInOrganization = !!this.cipher.organizationId;
        const hasSelectedCollection = this.collections.some(c => !!(c as any).checked);

        return hasSelectedCollection || isCipherInOrganization;
    }

    async unshare(): Promise<boolean> {
        try {
            this.formPromise = this.localCipherService.unshare(this.cipher)
                .then(async () => {
                    this.onSharedCipher.emit();
                    this.platformUtilsService.showToast('success', null, this.i18nService.t('unsharedItem'));
                });

            await this.formPromise;
            return true;
        } catch { }
        return false;
    }
}
