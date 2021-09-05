import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { LogService } from 'jslib/abstractions/log.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { ProfileOrganizationResponse } from 'jslib/models/response/profileOrganizationResponse';

import { CryptoService as CryptoServiceBase } from 'jslib/services/crypto.service';

const Keys = {
    encOrgKeys: 'encOrgKeys',
};

export class CryptoService extends CryptoServiceBase {
    private localStorageService: StorageService;

    constructor(storageService: StorageService, secureStorageService: StorageService,
        cryptoFunctionService: CryptoFunctionService, platformUtilService: PlatformUtilsService,
        logService: LogService) {
            super(storageService, secureStorageService,
                cryptoFunctionService, platformUtilService,
                logService);

            this.localStorageService = storageService;
    }

    async upsertOrganizationKey(organization: ProfileOrganizationResponse) {
        if (organization.key === '') {
            return;
        }
        const encOrgKeys = await this.localStorageService.get<any>(Keys.encOrgKeys);

        encOrgKeys[organization.id] = organization.key;

        await this.clearOrgKeys();
        await this.localStorageService.save(Keys.encOrgKeys, encOrgKeys);
    }

    setOrgKeys(orgs: ProfileOrganizationResponse[]): Promise<{}> {
        const validOrgs = orgs.filter(org => org.key !== '');

        return super.setOrgKeys(validOrgs);
    }
}
