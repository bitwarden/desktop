angular
    .module('bit.settings')

    .controller('settingsAddFolderController', function ($scope, $q, folderService, $state, toastr) {
        $scope.folder = {};
        popupUtils.initListSectionItemListeners();
        $('#name').focus();

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error('Name is required.', 'Errors have occurred');
                return;
            }

            $scope.savePromise = $q.when(folderService.encrypt(model)).then(function (folderModel) {
                var folder = new Folder(folderModel, true);
                return $q.when(folderService.saveWithServer(folder)).then(function (folder) {
                    toastr.success('Added folder');
                    $state.go('folders', { animation: 'out-slide-down' });
                });
            });
        };
    });
