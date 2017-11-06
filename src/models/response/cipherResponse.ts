import { AttachmentResponse } from './attachmentResponse';

class CipherResponse {
    id: string;
    organizationId: string;
    folderId: string;
    type: number;
    favorite: boolean;
    edit: boolean;
    organizationUseTotp: boolean;
    data: any;
    revisionDate: string;
    attachments: AttachmentResponse[];

    constructor(response: any) {
        this.id = response.Id;
        this.organizationId = response.OrganizationId;
        this.folderId = response.FolderId;
        this.type = response.Type;
        this.favorite = response.Favorite;
        this.edit = response.Edit;
        this.organizationUseTotp = response.OrganizationUseTotp;
        this.data = response.Data;
        this.revisionDate = response.RevisionDate;

        if (response.Attachments != null) {
            this.attachments = [];
            for (const attachment of response.Attachments) {
                this.attachments.push(new AttachmentResponse(attachment));
            }
        }
    }
}

export { CipherResponse };
(window as any).CipherResponse = CipherResponse;
