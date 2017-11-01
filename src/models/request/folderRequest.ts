class FolderRequest {
    name: string;

    constructor(folder: any) { // TODO: folder type
        this.name = folder.name ? folder.name.encryptedString : null;
    }
}

export { FolderRequest };
(window as any).FolderRequest = FolderRequest;
