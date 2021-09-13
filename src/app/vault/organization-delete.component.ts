import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CipherService } from '../../services/cipher.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';
import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';
import { CollectionView } from 'jslib/models/view/collectionView';

@Component({
    selector: 'app-organization-delete',
    templateUrl: 'organization-delete.component.html',
})
export class OrganizationDeleteComponent implements OnInit {
    @Input() organizationId: string;
    @Output() onDeletedOrganization = new EventEmitter<Organization>();

    title: string;
    organizationName: string;
    organization: Organization;
    masterPassword: string;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, protected i18nService: I18nService,
        protected platformUtilsService: PlatformUtilsService, private cryptoService: CryptoService,
        private searchService: SearchService, private userService: UserService,
        private collectionService: CollectionService, private cipherService: CipherService) { }

    async ngOnInit() {
        await this.init();
    }

    async removeAllCiphersFromCollection(collection: CollectionView) {
        const collectionCiphers = await this.searchService.searchCiphers(
            null,
            [c => c.collectionIds != null && c.collectionIds.indexOf(collection.id) > -1],
            null
        );

        for (const cipher of collectionCiphers) {
            await this.cipherService.unshare(cipher);
        }
    }

    async removeAllCollections() {
        const allCollections = await this.collectionService.getAllDecrypted();
        const collections = allCollections
            .filter(collection => collection.organizationId === this.organizationId);

        for (const collection of collections) {
            await this.removeAllCiphersFromCollection(collection);
        }
    }

    async deleteOrganization() {
        await this.removeAllCollections();

        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);

        await this.apiService.deleteOrganization(this.organizationId, request);
    }

    async submit(): Promise<boolean> {
        if (this.masterPassword == null || this.masterPassword === '') {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return false;
        }

        try {
            this.formPromise = this.deleteOrganization();
            await this.formPromise;
            this.platformUtilsService.showToast(
                'success',
                this.i18nService.t('organizationDeleted'),
                this.i18nService.t('organizationDeletedDesc')
            );
            this.onDeletedOrganization.emit(this.organization);
            return true;
        } catch { }

        return false;
    }

    protected async init() {
        this.title = this.i18nService.t('deleteOrganizationTitle');
        this.organization = await this.userService.getOrganization(this.organizationId);
        this.organizationName = this.organization.name;
    }
}