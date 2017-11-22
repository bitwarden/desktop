import { CollectionData } from '../data/collectionData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Collection extends Domain {
    id: string;
    organizationId: string;
    name: CipherString;

    constructor(obj?: CollectionData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            id: null,
            organizationId: null,
            name: null,
        }, alreadyEncrypted, ['id', 'organizationId']);
    }

    decrypt(): Promise<any> {
        const model = {
            id: this.id,
            organizationId: this.organizationId,
        };

        return this.decryptObj(model, {
            name: null,
        }, this.organizationId);
    }
}

export { Collection };
(window as any).Collection = Collection;
