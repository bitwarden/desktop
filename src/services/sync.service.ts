import { CipherData } from '../models/data/cipherData';
import { CollectionData } from '../models/data/collectionData';
import { FolderData } from '../models/data/folderData';

import { CipherResponse } from '../models/response/cipherResponse';
import { CollectionResponse } from '../models/response/collectionResponse';
import { DomainsResponse } from '../models/response/domainsResponse';
import { FolderResponse } from '../models/response/folderResponse';
import { ProfileResponse } from '../models/response/profileResponse';
import { SyncResponse } from '../models/response/syncResponse';

import ApiService from './api.service';
import CipherService from './cipher.service';
import CollectionService from './collection.service';
import CryptoService from './crypto.service';
import FolderService from './folder.service';
import SettingsService from './settings.service';
import UserService from './user.service';
import UtilsService from './utils.service';

const Keys = {
    lastSyncPrefix: 'lastSync_',
};

export default class SyncService {
    syncInProgress: boolean = false;

    constructor(private userService: UserService, private apiService: ApiService,
        private settingsService: SettingsService, private folderService: FolderService,
        private cipherService: CipherService, private cryptoService: CryptoService,
        private collectionService: CollectionService, private logoutCallback: Function) {
    }

    async getLastSync() {
        const userId = await this.userService.getUserId();
        const lastSync = await UtilsService.getObjFromStorage<any>(Keys.lastSyncPrefix + userId);
        if (lastSync) {
            return new Date(lastSync);
        }

        return null;
    }

    async setLastSync(date: Date) {
        const userId = await this.userService.getUserId();
        await UtilsService.saveObjToStorage(Keys.lastSyncPrefix + userId, date.toJSON());
    }

    syncStarted() {
        this.syncInProgress = true;
        chrome.runtime.sendMessage({ command: 'syncStarted' });
    }

    syncCompleted(successfully: boolean) {
        this.syncInProgress = false;
        // tslint:disable-next-line
        chrome.runtime.sendMessage({ command: 'syncCompleted', successfully: successfully });
    }

    async fullSync(forceSync: boolean) {
        this.syncStarted();
        const isAuthenticated = await this.userService.isAuthenticated();
        if (!isAuthenticated) {
            this.syncCompleted(false);
            return false;
        }

        const now = new Date();
        const needsSyncResult = await this.needsSyncing(forceSync);
        const needsSync = needsSyncResult[0];
        const skipped = needsSyncResult[1];

        if (skipped) {
            this.syncCompleted(false);
            return false;
        }

        if (!needsSync) {
            await this.setLastSync(now);
            this.syncCompleted(false);
            return false;
        }

        const userId = await this.userService.getUserId();
        try {
            const response = await this.apiService.getSync();

            await this.syncProfile(response.profile);
            await this.syncFolders(userId, response.folders);
            await this.syncCollections(response.collections);
            await this.syncCiphers(userId, response.ciphers);
            await this.syncSettings(userId, response.domains);

            await this.setLastSync(now);
            this.syncCompleted(true);
            return true;
        } catch (e) {
            this.syncCompleted(false);
            return false;
        }
    }

    // Helpers

    private async needsSyncing(forceSync: boolean) {
        if (forceSync) {
            return [true, false];
        }

        try {
            const response = await this.apiService.getAccountRevisionDate();
            const accountRevisionDate = new Date(response);
            const lastSync = await this.getLastSync();
            if (lastSync != null && accountRevisionDate <= lastSync) {
                return [false, false];
            }

            return [true, false];
        } catch (e) {
            return [false, true];
        }
    }

    private async syncProfile(response: ProfileResponse) {
        const stamp = await this.userService.getSecurityStamp();
        if (stamp != null && stamp !== response.securityStamp) {
            if (this.logoutCallback != null) {
                this.logoutCallback(true);
            }

            throw new Error('Stamp has changed');
        }

        await this.cryptoService.setEncKey(response.key);
        await this.cryptoService.setEncPrivateKey(response.privateKey);
        await this.cryptoService.setOrgKeys(response.organizations);
        await this.userService.setSecurityStamp(response.securityStamp);
    }

    private async syncFolders(userId: string, response: FolderResponse[]) {
        const folders: { [id: string]: FolderData; } = {};
        response.forEach((f) => {
            folders[f.id] = new FolderData(f, userId);
        });
        return await this.folderService.replace(folders);
    }

    private async syncCollections(response: CollectionResponse[]) {
        const collections: { [id: string]: CollectionData; } = {};
        response.forEach((c) => {
            collections[c.id] = new CollectionData(c);
        });
        return await this.collectionService.replace(collections);
    }

    private async syncCiphers(userId: string, response: CipherResponse[]) {
        const ciphers: { [id: string]: CipherData; } = {};
        response.forEach((c) => {
            ciphers[c.id] = new CipherData(c, userId);
        });
        return await this.cipherService.replace(ciphers);
    }

    private async syncSettings(userId: string, response: DomainsResponse) {
        let eqDomains: string[][] = [];
        if (response != null && response.equivalentDomains != null) {
            eqDomains = eqDomains.concat(response.equivalentDomains);
        }

        if (response != null && response.globalEquivalentDomains != null) {
            response.globalEquivalentDomains.forEach((global) => {
                if (global.domains.length > 0) {
                    eqDomains.push(global.domains);
                }
            });
        }

        return this.settingsService.setEquivalentDomains(eqDomains);
    }
}
