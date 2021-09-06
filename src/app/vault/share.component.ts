import { Component } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
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

    constructor(cipherService: CipherService, i18nService: I18nService,
        collectionService: CollectionService, userService: UserService,
        platformUtilsService: PlatformUtilsService) {
        super(collectionService, platformUtilsService, i18nService, userService, cipherService);
    }

    filterCollections() {
        this.writeableCollections.forEach(c => (c as any).checked = false);

        this.collections = this.writeableCollections;
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
        const selectedCollection = this.collections
            .filter(c => !!(c as any).checked);

        if (selectedCollection.length !== 1) {
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
}
