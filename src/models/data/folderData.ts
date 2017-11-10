import { FolderResponse } from '../response/folderResponse';

class FolderData {
    id: string;
    userId: string;
    name: string;
    revisionDate: string;

    constructor(response: FolderResponse, userId: string) {
        this.userId = userId;
        this.name = response.name;
        this.id = response.id;
        this.revisionDate = response.revisionDate;
    }
}

export { FolderData };
(window as any).FolderData = FolderData;
