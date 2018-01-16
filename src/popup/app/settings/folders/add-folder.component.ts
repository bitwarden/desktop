import * as angular from 'angular';
import * as template from './add-folder.component.html';

import { Folder } from 'jslib/models/domain/folder';

import { FolderService } from 'jslib/abstractions/folder.service';

import { PopupUtilsService } from '../../services/popupUtils.service';

export class AddFolderController {
    savePromise: any;
    folder: {};
    i18n: any;

    constructor(private folderService: FolderService, private $state: any, private toastr: any,
        private $analytics: any, private i18nService: any, $timeout: ng.ITimeoutService) {
        $timeout(() => {
            PopupUtilsService.initListSectionItemListeners(document, angular);
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

        this.savePromise = this.folderService.encrypt(model).then((folder: Folder) => {
            return this.folderService.saveWithServer(folder);
        }).then(() => {
            this.$analytics.eventTrack('Added Folder');
            this.toastr.success(this.i18nService.addedFolder);
            this.$state.go('^.list', { animation: 'out-slide-down' });
        });
    }
}

AddFolderController.$inject = ['folderService', '$state', 'toastr', '$analytics', 'i18nService', '$timeout'];

export const AddFolderComponent = {
    bindings: {},
    controller: AddFolderController,
    template: template,
};
