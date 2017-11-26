import { Folder } from '../../../../models/domain/folder';
import * as template from './folders.component.html';

class FoldersController {
    folders: Folder[] = [];
    i18n: any;
    loaded = false;

    constructor(private folderService: any, private $state: any, i18nService: any) {
        this.i18n = i18nService;

        this.load();
    }

    load() {
        this.folderService
            .getAllDecrypted()
            .then((folders: any) => {
                if (folders.length > 0 && folders[0].id === null) {
                    // remove the "none" folder
                    this.folders = folders.slice(1);
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

export const FoldersComponent = {
    bindings: {},
    controller: FoldersController,
    template,
};
