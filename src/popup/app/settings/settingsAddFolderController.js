angular
    .module('bit.settings')

    .controller('settingsAddFolderController', function ($scope, $q, folderService, $state, toastr, utilsService,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.folder = {};
        utilsService.initListSectionItemListeners($(document), angular);
        $('#name').focus();

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = $q.when(folderService.encrypt(model)).then(function (folderModel) {
                var folder = new Folder(folderModel, true);
                return $q.when(folderService.saveWithServer(folder)).then(function (folder) {
                    $analytics.eventTrack('Added Folder');
                    toastr.success(i18nService.addedFolder);
                    $state.go('folders', { animation: 'out-slide-down' });
                });
            });
        };
    });
