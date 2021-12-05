import { Q } from 'cozy-client';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { OrganizationData } from 'jslib/models/data/organizationData';
import { Organization } from 'jslib/models/domain/organization';
import { ProfileOrganizationResponse } from 'jslib/models/response/profileOrganizationResponse';

import { ApiService } from 'jslib/services/api.service';
import { UserService as UserServiceBase } from 'jslib/services/user.service';

import { CozyClientService } from '../cozy/services/cozy-client.service';

const Keys = {
    organizationsPrefix: 'organizations_',
};

// Cozy customization, store "Cozy Connectors" organization and collection from user settings
// /*
interface KonnectorsOrg {
    organizationId: string;
    collectionId: string;
}
// */

export class UserService extends UserServiceBase {
    private localStorageService: StorageService;

    // Cozy customization, store "Cozy Connectors" organization and collection from user settings
    // /*
    private konnectorsOrg: KonnectorsOrg = null;
    // */

    constructor(tokenService: TokenService, storageService: StorageService, private cryptoService: CryptoService, private apiService: ApiService,
        protected clientService: CozyClientService
    ) {
        super(tokenService, storageService);

        this.localStorageService = storageService;
    }

    async upsertOrganization(organization: ProfileOrganizationResponse) {
        const userId = await this.getUserId();

        const organizations = await this.getAllOrganizations();

        organizations.push(
            new Organization(
                new OrganizationData(organization)
            )
        );

        const organizationsData: { [id: string]: OrganizationData; } = {};
        organizations.forEach(o => {
            organizationsData[o.id] = o as OrganizationData;
        });

        await this.localStorageService.save(Keys.organizationsPrefix + userId, organizationsData);
    }

    async deleteOrganization(organizationId: string) {
        const userId = await this.getUserId();

        const oldOrganizations = await this.getAllOrganizations();

        const newOrganizations = oldOrganizations.filter(organization => organization.id !== organizationId);

        const organizationsData: { [id: string]: OrganizationData; } = {};
        newOrganizations.forEach(o => {
            organizationsData[o.id] = o as OrganizationData;
        });

        await this.localStorageService.save(Keys.organizationsPrefix + userId, organizationsData);
    }

    async getOrganizationsWithoutKey() {
        const organizations = await this.getAllOrganizations();

        const organizationKeys = await this.cryptoService.getOrgKeys();

        const organizationsWithoutKey = organizations
            .filter(organization => !organizationKeys.has(organization.id));

        return organizationsWithoutKey;
    }

    async getOrganizationOwner(organizationId: string) {
        const organization = await this.getOrganization(organizationId);

        const organizationUsers = await this.apiService.getOrganizationUsers(organization.id);

        const owner = organizationUsers.data
            .find(organizationUser => organizationUser.type === OrganizationUserType.Owner);

        return owner;
    }

    // Cozy customization, get "Cozy Connectors" organization and collection from user settings
    // /*
    async getKonnectorsOrganization(): Promise<KonnectorsOrg> {
        if (this.konnectorsOrg) {
            return this.konnectorsOrg;
        }

        const settings = await this.clientService.GetClient().stackClient.fetchJSON(
            'GET',
            '/data/io.cozy.settings/io.cozy.settings.bitwarden'
        );

        this.konnectorsOrg = {
            organizationId: settings.organization_id,
            collectionId: settings.collection_id,
        };

        return this.konnectorsOrg;
    }
    // */
}
