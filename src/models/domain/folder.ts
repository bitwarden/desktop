import { CipherString } from './cipherString';
import { FolderData } from '../data/folderData'

import Domain from './domain'

class Folder extends Domain {
    id: string;
    name: CipherString;

    constructor(obj?: FolderData, alreadyEncrypted: boolean = false) {
        super();
        if(obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            id: null,
            name: null
        }, alreadyEncrypted, ['id']);
    }

    async decrypt(): Promise<any> {
        var self = this;
        var model = {
            id: self.id
        };

        return await this.decryptObj(model, this, {
            name: null
        }, null);
    }
}

export { Folder };
(window as any).Folder = Folder;
