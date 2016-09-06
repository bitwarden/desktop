angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, siteService, cryptoService) {
        $scope.site = {
            folderId: null
        };

        $scope.editSite = function (model) {
            
        };

        $scope.close = function () {
            $scope.parentScope.closeEditSite();
        };
    });
