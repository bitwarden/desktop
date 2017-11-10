class FolderResponse {
    id: string;
    name: string;
    revisionDate: string;

    constructor(response: any) {
        this.id = response.Id;
        this.name = response.Name;
        this.revisionDate = response.RevisionDate;
    }
}

export { FolderResponse };
(window as any).FolderResponse = FolderResponse;
