import { Enums, Data } from '@bitwarden/jslib';

import Domain from './domain';

class SecureNote extends Domain {
    type: Enums.SecureNoteType;

    constructor(obj?: Data.SecureNote, alreadyEncrypted: boolean = false) {
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
