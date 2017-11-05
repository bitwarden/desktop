import { CipherString } from '../models/domain/cipherString';
import { Folder } from '../models/domain/folder';

import { FolderData } from '../models/data/folderData';

import { FolderRequest } from '../models/request/folderRequest';
import { FolderResponse } from '../models/response/folderResponse';

import ApiService from './api.service';
import ConstantsService from './constants.service';
import CryptoService from './crypto.service';
import UserService from './user.service';
import UtilsService from './utils.service';

const Keys = {
    foldersPrefix: 'folders_',
};

export default class FolderService {
    decryptedFolderCache: any[];

    constructor(private cryptoService: CryptoService, private userService: UserService,
                private i18nService: any, private apiService: ApiService) {
    }

    clearCache(): void {
        this.decryptedFolderCache = null;
    }

    async encrypt(model: any): Promise<Folder> {
        const folder = new Folder();
        folder.name = await this.cryptoService.encrypt(model.name);
        return folder;
    }

    async get(id: string): Promise<Folder> {
        const userId = await this.userService.getUserId();
        const folders = await UtilsService.getObjFromStorage<Map<string, FolderData>>(Keys.foldersPrefix + userId);
        if (folders == null || !folders.has(id)) {
            return null;
        }

        return new Folder(folders.get(id));
    }

    async getAll(): Promise<Folder[]> {
        const userId = await this.userService.getUserId();
        const folders = await UtilsService.getObjFromStorage<Map<string, FolderData>>(Keys.foldersPrefix + userId);
        const response: Folder[] = [];
        folders.forEach((folder) => {
            response.push(new Folder(folder));
        });
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

        const promises = [];
        const folders = await this.getAll();
        for (const folder of folders) {
            promises.push(folder.decrypt().then((f: any) => {
                decFolders.push(f);
            }));
        }

        await Promise.all(promises);
        this.decryptedFolderCache = decFolders;
        return this.decryptedFolderCache;
    }

    async saveWithServer(folder: Folder): Promise<any> {
        const request = new FolderRequest(folder);

        let response: FolderResponse;
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
        let folders = await UtilsService.getObjFromStorage<Map<string, FolderData>>(Keys.foldersPrefix + userId);
        if (folders == null) {
            folders = new Map<string, FolderData>();
        }

        if (folder instanceof FolderData) {
            const f = folder as FolderData;
            folders.set(f.id, f);
        } else {
            for (const f of (folder as FolderData[])) {
                folders.set(f.id, f);
            }
        }

        await UtilsService.saveObjToStorage(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async replace(folders: FolderData[]): Promise<any> {
        const userId = await this.userService.getUserId();
        await UtilsService.saveObjToStorage(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async clear(userId: string): Promise<any> {
        await UtilsService.removeFromStorage(Keys.foldersPrefix + userId);
        this.decryptedFolderCache = null;
    }

    async delete(id: string | string[]): Promise<any> {
        const userId = await this.userService.getUserId();
        const folders = await UtilsService.getObjFromStorage<Map<string, FolderData>>(Keys.foldersPrefix + userId);
        if (folders == null) {
            return;
        }

        if (id instanceof String) {
            const i = id as string;
            folders.delete(i);
        } else {
            for (const i of (id as string[])) {
                folders.delete(i);
            }
        }

        await UtilsService.saveObjToStorage(Keys.foldersPrefix + userId, folders);
        this.decryptedFolderCache = null;
    }

    async deleteWithServer(id: string): Promise<any> {
        await this.apiService.deleteFolder(id);
        await this.delete(id);
    }
}
