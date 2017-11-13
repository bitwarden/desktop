import { Folder } from '../domain/folder';

class FolderRequest {
    name: string;

    constructor(folder: Folder) {
        this.name = folder.name ? folder.name.encryptedString : null;
    }
}

export { FolderRequest };
(window as any).FolderRequest = FolderRequest;
