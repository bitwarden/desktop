import * as angular from 'angular';
import * as template from './add-folder.component.html';

import { Folder } from 'jslib/models/domain/folder';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

export class AddFolderController {
    savePromise: any;
    folder: {};
    i18n: any;

    constructor(private folderService: any, private $state: any, private toastr: any,
        platformUtilsService: PlatformUtilsService, private $analytics: any, private i18nService: any,
        $timeout: ng.ITimeoutService) {
        $timeout(() => {
            platformUtilsService.initListSectionItemListeners(document, angular);
            document.getElementById('name').focus();
        }, 500);

        this.i18n = i18nService;
        this.folder = {};
        this.savePromise = null;
    }

    save(model: any) {
        if (!model.name) {
            this.toastr.error(this.i18nService.nameRequired, this.i18nService.errorsOccurred);
            return;
        }

        this.savePromise = this.folderService.encrypt(model).then((folderModel: any) => {
            const folder = new Folder(folderModel, true);
            return this.folderService.saveWithServer(folder);
        }).then((folder: any) => {
            this.$analytics.eventTrack('Added Folder');
            this.toastr.success(this.i18nService.addedFolder);
            this.$state.go('^.list', { animation: 'out-slide-down' });
        });
    }
}

export const AddFolderComponent = {
    bindings: {},
    controller: AddFolderController,
    template: template,
};
