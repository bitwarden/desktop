import { CryptoService } from 'jslib/abstractions/crypto.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { OrganizationData } from 'jslib/models/data/organizationData';
import { Organization } from 'jslib/models/domain/organization';
import { ProfileOrganizationResponse } from 'jslib/models/response/profileOrganizationResponse';

import { UserService as UserServiceBase } from 'jslib/services/user.service';

const Keys = {
    organizationsPrefix: 'organizations_',
};

export class UserService extends UserServiceBase {
    private localStorageService: StorageService;

    constructor(tokenService: TokenService, storageService: StorageService, private cryptoService: CryptoService) {
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

        const newOrganizations = oldOrganizations.filter(organization => organization.id === organizationId);

        const organizationsData: { [id: string]: OrganizationData; } = {};
        newOrganizations.forEach(o => {
            organizationsData[o.id] = o as OrganizationData;
        });

        await this.localStorageService.save(Keys.organizationsPrefix + userId, organizationsData);
    }
}
