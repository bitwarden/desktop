import { Response } from '@bitwarden/jslib';

class FolderData {
    id: string;
    userId: string;
    name: string;
    revisionDate: string;

    constructor(response: Response.Folder, userId: string) {
        this.userId = userId;
        this.name = response.name;
        this.id = response.id;
        this.revisionDate = response.revisionDate;
    }
}

export { FolderData };
(window as any).FolderData = FolderData;
