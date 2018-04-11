import * as angular from 'angular';
import * as template from './edit-folder.component.html';

import { Folder } from 'jslib/models/domain/folder';

import { FolderService } from 'jslib/abstractions/folder.service';

import { PopupUtilsService } from '../../services/popupUtils.service';

export class EditFolderController {
    $transition$: any;
    folderId: string;
    savePromise: Promise<any> = null;
    i18n: any;
    folder: Folder;

    constructor($scope: any, $stateParams: any, private folderService: FolderService, private toastr: any,
        private $state: any, private SweetAlert: any, private $analytics: any, private i18nService: any,
        $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            PopupUtilsService.initListSectionItemListeners(document, angular);
            document.getElementById('name').focus();
        }, 500);

        $scope.folder = {};
    }

    $onInit() {
        this.folderId = this.$transition$.params('to').folderId;
        this.folderService.get(this.folderId).then((folder: any) => {
            return folder.decrypt();
        }).then((model: Folder) => {
            this.folder = model;
        });
    }

    save(model: any) {
        if (!model.name) {
            this.toastr.error(this.i18nService.nameRequired, this.i18nService.errorsOccurred);
            return;
        }

        this.savePromise = this.folderService.encrypt(model).then((folder: Folder) => {
            return this.folderService.saveWithServer(folder);
        }).then(() => {
            this.$analytics.eventTrack('Edited Folder');
            this.toastr.success(this.i18nService.editedFolder);
            this.$state.go('^.list', { animation: 'out-slide-down' });
        });
    }

    delete() {
        this.SweetAlert.swal({
            title: this.i18nService.deleteFolder,
            text: this.i18nService.deleteFolderConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.no,
        }, (confirmed: boolean) => {
            if (confirmed) {
                this.folderService.deleteWithServer(this.folderId).then(() => {
                    this.$analytics.eventTrack('Deleted Folder');
                    this.toastr.success(this.i18nService.deletedFolder);
                    this.$state.go('^.list', {
                        animation: 'out-slide-down',
                    });
                });
            }
        });
    }
}

EditFolderController.$inject = ['$scope', '$stateParams', 'folderService', 'toastr', '$state', 'SweetAlert',
    '$analytics', 'i18nService', '$timeout'];

export const EditFolderComponent = {
    bindings: {
        $transition$: '<',
    },
    controller: EditFolderController,
    template: template,
};
