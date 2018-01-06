import { SecureNoteType } from '@bitwarden/jslib';

class SecureNoteData {
    type: SecureNoteType;

    constructor(data: any) {
        this.type = data.Type;
    }
}

export { SecureNoteData };
(window as any).SecureNoteData = SecureNoteData;
