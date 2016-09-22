angular
    .module('bit.settings')

    .controller('settingsEditFolderController', function ($scope, $stateParams, folderService, toastr, $q, $state) {
        $scope.folder = {};
        var folderId = $stateParams.folderId;

        folderService.get(folderId, function (folder) {
            $q.when(folder.decrypt()).then(function (model) {
                $scope.folder = model;
            });
        });

        popupUtils.initListSectionItemListeners();

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error('Name is required.', 'Errors have occurred');
                return;
            }

            $scope.savePromise = $q.when(folderService.encrypt(model)).then(function (folderModel) {
                var folder = new Folder(folderModel, true);
                return $q.when(folderService.saveWithServer(folder)).then(function (folder) {
                    toastr.success('Edited folder');
                    $state.go('folders', { animation: 'out-slide-down' });
                });
            });
        };
    });
