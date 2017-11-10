import { FieldType } from '../../enums/fieldType.enum';

import { FieldData } from '../data/fieldData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Field extends Domain {
    name: CipherString;
    vault: CipherString;
    type: FieldType;

    constructor(obj?: FieldData, alreadyEncrypted: boolean = false) {
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
