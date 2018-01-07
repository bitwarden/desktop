import { Enums } from '@bitwarden/jslib';

class SecureNoteData {
    type: Enums.SecureNoteType;

    constructor(data: any) {
        this.type = data.Type;
    }
}

export { SecureNoteData };
(window as any).SecureNoteData = SecureNoteData;
