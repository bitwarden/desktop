import { CipherResponse } from './cipherResponse';
import { DomainsResponse } from './domainsResponse';
import { FolderResponse } from './folderResponse';
import { ProfileResponse } from './profileResponse';

class SyncResponse {
    profile?: ProfileResponse;
    folders: FolderResponse[] = [];
    ciphers: CipherResponse[] = [];
    domains?: DomainsResponse;

    constructor(response: any) {
        if (response.Profile) {
            this.profile = new ProfileResponse(response.Profile);
        }

        if (response.Folders) {
            for (const folder of response.Folders) {
                this.folders.push(new FolderResponse(folder));
            }
        }

        if (response.Ciphers) {
            for (const cipher of response.Ciphers) {
                this.ciphers.push(new CipherResponse(cipher));
            }
        }

        if (response.Domains) {
            this.domains = new DomainsResponse(response.Domains);
        }
    }
}

export { SyncResponse };
(window as any).SyncResponse = SyncResponse;
