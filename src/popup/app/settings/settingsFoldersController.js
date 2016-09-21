angular
    .module('bit.settings')

    .controller('settingsFoldersController', function ($scope, folderService, $q) {
        $scope.loaded = false;

        load();
        function load() {
            var foldersPromise = $q.when(folderService.getAllDecrypted());
            foldersPromise.then(function (folders) {
                $scope.loaded = true;
                $scope.folders = folders;
            });
        }
    });
