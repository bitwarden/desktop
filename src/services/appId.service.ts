import UtilsService from './utils.service';

import { StorageService } from './abstractions/storage.service';

export default class AppIdService {
    constructor(private storageService: StorageService) {
    }

    getAppId(): Promise<string> {
        return this.makeAndGetAppId('appId');
    }

    getAnonymousAppId(): Promise<string> {
        return this.makeAndGetAppId('anonymousAppId');
    }

    private async makeAndGetAppId(key: string) {
        const existingId = await this.storageService.get<string>(key);
        if (existingId != null) {
            return existingId;
        }

        const guid = UtilsService.newGuid();
        await this.storageService.save(key, guid);
        return guid;
    }
}
