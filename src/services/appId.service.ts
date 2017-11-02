import UtilsService from './utils.service';

export default class AppIdService {
    static getAppId(): Promise<string> {
        return AppIdService.makeAndGetAppId('appId');
    }

    static getAnonymousAppId(): Promise<string> {
        return AppIdService.makeAndGetAppId('anonymousAppId');
    }

    private static async makeAndGetAppId(key: string) {
        const existingId = await UtilsService.getObjFromStorage<string>(key);
        if (existingId != null) {
            return existingId;
        }

        const guid = UtilsService.newGuid();
        await UtilsService.saveObjToStorage(key, guid);
        return guid;
    }

    // TODO: remove these in favor of static methods
    getAppId(): Promise<string> {
        return AppIdService.getAppId();
    }

    getAnonymousAppId(): Promise<string> {
        return AppIdService.getAnonymousAppId();
    }
}
