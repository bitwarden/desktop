import { AttachmentData } from '../data/attachmentData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Attachment extends Domain {
    id: string;
    url: string;
    size: number;
    sizeName: string;
    fileName: CipherString;

    constructor(obj?: AttachmentData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.size = obj.size;
        this.buildDomainModel(this, obj, {
            id: null,
            url: null,
            sizeName: null,
            fileName: null,
        }, alreadyEncrypted, ['id', 'url', 'sizeName']);
    }

    decrypt(orgId: string): Promise<any> {
        const model = {
            id: this.id,
            size: this.size,
            sizeName: this.sizeName,
            url: this.url,
        };

        return this.decryptObj(model, {
            fileName: null,
        }, orgId);
    }
}

export { Attachment };
(window as any).Attachment = Attachment;
