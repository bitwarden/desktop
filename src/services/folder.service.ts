import { CipherString } from '../models/domain/cipherString';

import { FolderData } from '../models/data/folderData';

import ApiService from './api.service';
import CryptoService from './crypto.service';
import UserService from './user.service';

import { Abstractions, Domain, Request, Response } from '@bitwarden/jslib';

const Keys = {
    foldersPrefix: 'folders_',
};

export default class FolderService {
    decryptedFolderCache: any[];

    constructor(private cryptoService: CryptoService, private userService: UserService,
        private i18nService: any, private apiService: ApiService,
        private storageService: Abstractions.StorageService) {
    }

    clearCache(): void {
        this.decryptedFolderCache = null;
    }

    async encrypt(model: any): Promise<Domain.Folder> {
        const folder = new Domain.Folder();
        folder.id = model.id;
        folder.name = await this.cryptoService.encrypt(model.name);
        return folder;
    }

    async get(id: string): Promise<Domain.Folder> {
        const userId = await this.userService.getUserId();
        const folders = await this.storageService.get<{ [id: string]: FolderData; }>(
            Keys.foldersPrefix + userId);
        if (folders == null || !folders.hasOwnProperty(id)) {
            return null;
        }

        return new Domain.Folder(folders[id]);
    }

    async getAll(): Promise<Domain.Folder[]> {
        const userId = await this.userService.getUserId();
        const folders = await this.storageService.get<{ [id: string]: FolderData; }>(
            Keys.foldersPrefix + userId);
        const response: Domain.Folder[] = [];
        for (const id in folders) {
            if (folders.hasOwnProperty(id)) {
                response.push(new Domain.Folder(folders[id]));
            }
        }
        return response;
    }

    async getAllDecrypted(): Promise<any[]> {
        if (this.decryptedFolderCache != null) {
            return this.decryptedFolderCache;
        }

        const decFolders: any[] = [{
            id: null,
            name: this.i18nService.noneFolder,
        }];

        const key = await this.cryptoService.getKey();
        if (key == null) {
            throw new Error('No key.');
        }

        const promises: Array<Promise<any>> = [];
        const folders = await this.getAll();
        folders.forEach((folder) => {
            promises.push(folder.decrypt().then((f: any) => {
                decFolders.push(f);
            }));
        });

        await Promise.all(promises);
        this.decryptedFolderCache = decFolders;
        return this.decryptedFolderCache;
    }

    async saveWithServer(folder: Domain.Folder): Promise<any> {
        const request = new Request.Folder(folder);

        let response: Response.Folder;
        if (folder.id == null) {
            response = await this.apiService.postFolder(request);
            folder.id = response.id;
        } else {
            response = await this.apiService.putFolder(folder.id, request);
        }

        const userId = await this.userService.getUserId();
        const data = new FolderData(response, userId);
        await this.upsert(data);
    }

    async upsert(folder: FolderData | FolderData[]): Promise<any> {
        const userId = await this.userService.getUserId();
        let folders = await this.storageService.get<{ [id: string]: FolderData; }>(
            Keys.foldersPrefix + userId);
        if (folders == null) {
            folders = {};
        }

        if (folder instanceof FolderData) {
            const f = folder as FolderData;
            folders[f.id] = f;
        } else {
            (folder as FolderData[]).forEach((f) => {
                folders[f.id] = f;
            });
        }

        await this.storageService.save(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async replace(folders: { [id: string]: FolderData; }): Promise<any> {
        const userId = await this.userService.getUserId();
        await this.storageService.save(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async clear(userId: string): Promise<any> {
        await this.storageService.remove(Keys.foldersPrefix + userId);
        this.decryptedFolderCache = null;
    }

    async delete(id: string | string[]): Promise<any> {
        const userId = await this.userService.getUserId();
        const folders = await this.storageService.get<{ [id: string]: FolderData; }>(
            Keys.foldersPrefix + userId);
        if (folders == null) {
            return;
        }

        if (typeof id === 'string') {
            const i = id as string;
            delete folders[id];
        } else {
            (id as string[]).forEach((i) => {
                delete folders[i];
            });
        }

        await this.storageService.save(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async deleteWithServer(id: string): Promise<any> {
        await this.apiService.deleteFolder(id);
        await this.delete(id);
    }
}
