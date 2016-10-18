angular
    .module('bit.settings')

    .controller('settingsEditFolderController', function ($scope, $stateParams, folderService, toastr, $q, $state, SweetAlert,
        utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.folder = {};
        var folderId = $stateParams.folderId;

        folderService.get(folderId, function (folder) {
            $q.when(folder.decrypt()).then(function (model) {
                $scope.folder = model;
            });
        });

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error('Name is required.', 'Errors have occurred');
                return;
            }

            $scope.savePromise = $q.when(folderService.encrypt(model)).then(function (folderModel) {
                var folder = new Folder(folderModel, true);
                return $q.when(folderService.saveWithServer(folder)).then(function (folder) {
                    $analytics.eventTrack('Edited Folder');
                    toastr.success('Edited folder');
                    $state.go('folders', { animation: 'out-slide-down' });
                });
            });
        };

        $scope.delete = function () {
            SweetAlert.swal({
                title: 'Delete Folder',
                text: 'Are you sure you want to delete this folder?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }, function (confirmed) {
                if (confirmed) {
                    $q.when(folderService.deleteWithServer(folderId)).then(function () {
                        $analytics.eventTrack('Deleted Folder');
                        toastr.success('Deleted folder');
                        $state.go('folders', {
                            animation: 'out-slide-down'
                        });
                    });
                }
            });
        };
    });
