import { CipherResponse } from './cipherResponse';
import { CollectionResponse } from './collectionResponse';
import { DomainsResponse } from './domainsResponse';
import { FolderResponse } from './folderResponse';
import { ProfileResponse } from './profileResponse';

class SyncResponse {
    profile?: ProfileResponse;
    folders: FolderResponse[] = [];
    collections: CollectionResponse[] = [];
    ciphers: CipherResponse[] = [];
    domains?: DomainsResponse;

    constructor(response: any) {
        if (response.Profile) {
            this.profile = new ProfileResponse(response.Profile);
        }

        if (response.Folders) {
            response.Folders.forEach((folder: any) => {
                this.folders.push(new FolderResponse(folder));
            });
        }

        if (response.Collections) {
            response.Collections.forEach((collection: any) => {
                this.collections.push(new CollectionResponse(collection));
            });
        }

        if (response.Ciphers) {
            response.Ciphers.forEach((cipher: any) => {
                this.ciphers.push(new CipherResponse(cipher));
            });
        }

        if (response.Domains) {
            this.domains = new DomainsResponse(response.Domains);
        }
    }
}

export { SyncResponse };
(window as any).SyncResponse = SyncResponse;
