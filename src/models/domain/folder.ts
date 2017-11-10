import { FolderData } from '../data/folderData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Folder extends Domain {
    id: string;
    name: CipherString;

    constructor(obj?: FolderData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            id: null,
            name: null,
        }, alreadyEncrypted, ['id']);
    }

    decrypt(): Promise<any> {
        const model = {
            id: this.id,
        };

        return this.decryptObj(model, {
            name: null,
        }, null);
    }
}

export { Folder };
(window as any).Folder = Folder;
