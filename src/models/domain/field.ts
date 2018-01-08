import { Enums, Data } from '@bitwarden/jslib';

import { CipherString } from './cipherString';
import Domain from './domain';

class Field extends Domain {
    name: CipherString;
    vault: CipherString;
    type: Enums.FieldType;

    constructor(obj?: Data.Field, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.type = obj.type;
        this.buildDomainModel(this, obj, {
            name: null,
            value: null,
        }, alreadyEncrypted, []);
    }

    decrypt(orgId: string): Promise<any> {
        const model = {
            type: this.type,
        };

        return this.decryptObj(model, {
            name: null,
            value: null,
        }, orgId);
    }
}

export { Field };
(window as any).Field = Field;
