import { CipherString } from '../models/domain/cipherString';
import { Collection } from '../models/domain/collection';

import { CollectionData } from '../models/data/collectionData';

import CryptoService from './crypto.service';
import UserService from './user.service';
import UtilsService from './utils.service';

const Keys = {
    collectionsPrefix: 'collections_',
};

export default class CollectionService {
    decryptedCollectionCache: any[];

    constructor(private cryptoService: CryptoService, private userService: UserService) {
    }

    clearCache(): void {
        this.decryptedCollectionCache = null;
    }

    async get(id: string): Promise<Collection> {
        const userId = await this.userService.getUserId();
        const collections = await UtilsService.getObjFromStorage<{ [id: string]: CollectionData; }>(
            Keys.collectionsPrefix + userId);
        if (collections == null || !collections.hasOwnProperty(id)) {
            return null;
        }

        return new Collection(collections[id]);
    }

    async getAll(): Promise<Collection[]> {
        const userId = await this.userService.getUserId();
        const collections = await UtilsService.getObjFromStorage<{ [id: string]: CollectionData; }>(
            Keys.collectionsPrefix + userId);
        const response: Collection[] = [];
        for (const id in collections) {
            if (collections.hasOwnProperty(id)) {
                response.push(new Collection(collections[id]));
            }
        }
        return response;
    }

    async getAllDecrypted(): Promise<any[]> {
        if (this.decryptedCollectionCache != null) {
            return this.decryptedCollectionCache;
        }

        const key = await this.cryptoService.getKey();
        if (key == null) {
            throw new Error('No key.');
        }

        const decFolders: any[] = [];
        const promises: Array<Promise<any>> = [];
        const folders = await this.getAll();
        folders.forEach((folder) => {
            promises.push(folder.decrypt().then((f: any) => {
                decFolders.push(f);
            }));
        });

        await Promise.all(promises);
        this.decryptedCollectionCache = decFolders;
        return this.decryptedCollectionCache;
    }

    async upsert(collection: CollectionData | CollectionData[]): Promise<any> {
        const userId = await this.userService.getUserId();
        let collections = await UtilsService.getObjFromStorage<{ [id: string]: CollectionData; }>(
            Keys.collectionsPrefix + userId);
        if (collections == null) {
            collections = {};
        }

        if (collection instanceof CollectionData) {
            const c = collection as CollectionData;
            collections[c.id] = c;
        } else {
            (collection as CollectionData[]).forEach((c) => {
                collections[c.id] = c;
            });
        }

        await UtilsService.saveObjToStorage(Keys.collectionsPrefix + userId, collections);
        this.decryptedCollectionCache = null;
    }

    async replace(collections: { [id: string]: CollectionData; }): Promise<any> {
        const userId = await this.userService.getUserId();
        await UtilsService.saveObjToStorage(Keys.collectionsPrefix + userId, collections);
        this.decryptedCollectionCache = null;
    }

    async clear(userId: string): Promise<any> {
        await UtilsService.removeFromStorage(Keys.collectionsPrefix + userId);
        this.decryptedCollectionCache = null;
    }

    async delete(id: string | string[]): Promise<any> {
        const userId = await this.userService.getUserId();
        const collections = await UtilsService.getObjFromStorage<{ [id: string]: CollectionData; }>(
            Keys.collectionsPrefix + userId);
        if (collections == null) {
            return;
        }

        if (typeof id === 'string') {
            const i = id as string;
            delete collections[id];
        } else {
            (id as string[]).forEach((i) => {
                delete collections[i];
            });
        }

        await UtilsService.saveObjToStorage(Keys.collectionsPrefix + userId, collections);
        this.decryptedCollectionCache = null;
    }
}
