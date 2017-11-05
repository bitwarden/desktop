import { SecureNoteType } from '../../enums/secureNoteType.enum';

import { SecureNoteData } from '../data/secureNoteData';

import Domain from './domain';

class SecureNote extends Domain {
    type: SecureNoteType;

    constructor(obj?: SecureNoteData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.type = obj.type;
    }

    decrypt(orgId: string): any {
        return {
            type: this.type,
        };
    }
}

export { SecureNote };
(window as any).SecureNote = SecureNote;
