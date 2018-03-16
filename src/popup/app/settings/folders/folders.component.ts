import * as template from './folders.component.html';

import { Folder } from 'jslib/models/domain/folder';

import { FolderService } from 'jslib/abstractions/folder.service';

export class FoldersController {
    folders: Folder[] = [];
    i18n: any;
    loaded = false;

    constructor(private folderService: FolderService, private $state: any, i18nService: any) {
        this.i18n = i18nService;
        this.load();
    }

    load() {
        this.folderService.getAllDecrypted().then((folders: any) => {
            if (folders.length > 0 && folders[folders.length - 1].id === null) {
                // remove the "none" folder
                this.folders = folders.slice(0, folders.length - 1);
            } else {
                this.folders = folders;
            }

            this.loaded = true;
        });
    }

    editFolder(folder: any) {
        this.$state.go('^.edit', {
            folderId: folder.id,
            animation: 'in-slide-up',
        });
    }
}

FoldersController.$inject = ['folderService', '$state', 'i18nService'];

export const FoldersComponent = {
    bindings: {},
    controller: FoldersController,
    template: template,
};
