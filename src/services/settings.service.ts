import UserService from './user.service';
import UtilsService from './utils.service';

const Keys = {
    settingsPrefix: 'settings_',
    equivalentDomains: 'equivalentDomains',
};

export default class SettingsService {
    private settingsCache: any;

    constructor(private userService: UserService) {
    }

    clearCache(): void {
        this.settingsCache = null;
    }

    getEquivalentDomains(): Promise<any> {
        return this.getSettingsKey(Keys.equivalentDomains);
    }

    async setEquivalentDomains(equivalentDomains: string[][]) {
        await this.setSettingsKey(Keys.equivalentDomains, equivalentDomains);
    }

    async clear(userId: string): Promise<void> {
        await UtilsService.removeFromStorage(Keys.settingsPrefix + userId);
        this.settingsCache = null;
    }

    // Helpers

    private async getSettings(): Promise<any> {
        if (this.settingsCache == null) {
            const userId = await this.userService.getUserId();
            this.settingsCache = UtilsService.getObjFromStorage(Keys.settingsPrefix + userId);
        }
        return this.settingsCache;
    }

    private async getSettingsKey(key: string): Promise<any> {
        const settings = await this.getSettings();
        if (settings != null && settings[key]) {
            return settings[key];
        }
        return null;
    }

    private async setSettingsKey(key: string, value: any): Promise<void> {
        const userId = await this.userService.getUserId();
        let settings = await this.getSettings();
        if (!settings) {
            settings = {};
        }

        settings[key] = value;
        await UtilsService.saveObjToStorage(Keys.settingsPrefix + userId, settings);
        this.settingsCache = settings;
    }
}
