import UserService from './user.service';

import { StorageService } from './abstractions/storage.service';

const Keys = {
    settingsPrefix: 'settings_',
    equivalentDomains: 'equivalentDomains',
};

export default class SettingsService {
    private settingsCache: any;

    constructor(private userService: UserService, private storageService: StorageService) {
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
        await this.storageService.remove(Keys.settingsPrefix + userId);
        this.settingsCache = null;
    }

    // Helpers

    private async getSettings(): Promise<any> {
        if (this.settingsCache == null) {
            const userId = await this.userService.getUserId();
            this.settingsCache = this.storageService.get(Keys.settingsPrefix + userId);
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
        await this.storageService.save(Keys.settingsPrefix + userId, settings);
        this.settingsCache = settings;
    }
}
