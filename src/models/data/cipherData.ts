import { CipherType } from '../../enums/cipherType.enum';

import { AttachmentData } from './attachmentData';
import { CardData } from './cardData';
import { FieldData } from './fieldData';
import { IdentityData } from './identityData';
import { LoginData } from './loginData';
import { SecureNoteData } from './secureNoteData';

import { CipherResponse } from '../response/cipherResponse';

class CipherData {
    id: string;
    organizationId: string;
    folderId: string;
    userId: string;
    edit: boolean;
    organizationUseTotp: boolean;
    favorite: boolean;
    revisionDate: string;
    type: CipherType;
    sizeName: string;
    name: string;
    notes: string;
    login?: LoginData;
    secureNote?: SecureNoteData;
    card?: CardData;
    identity?: IdentityData;
    fields?: FieldData[];
    attachments?: AttachmentData[];

    constructor(response: CipherResponse, userId: string) {
        this.id = response.id;
        this.organizationId = response.organizationId;
        this.folderId = response.folderId;
        this.userId = userId;
        this.edit = response.edit;
        this.organizationUseTotp = response.organizationUseTotp;
        this.favorite = response.favorite;
        this.revisionDate = response.revisionDate;
        this.type = response.type;

        this.name = response.data.Name;
        this.notes = response.data.Notes;

        switch (this.type) {
            case CipherType.Login:
                this.login = new LoginData(response.data);
                break;
            case CipherType.SecureNote:
                this.secureNote = new SecureNoteData(response.data);
                break;
            case CipherType.Card:
                this.card = new CardData(response.data);
                break;
            case CipherType.Identity:
                this.identity = new IdentityData(response.data);
                break;
            default:
                break;
        }

        if (response.data.Fields != null) {
            this.fields = [];
            for (const field of response.data.Fields) {
                this.fields.push(new FieldData(field));
            }
        }

        if (response.attachments != null) {
            this.attachments = [];
            for (const attachment of response.attachments) {
                this.attachments.push(new AttachmentData(attachment));
            }
        }
    }
}

export { CipherData };
(window as any).CipherData = CipherData;
