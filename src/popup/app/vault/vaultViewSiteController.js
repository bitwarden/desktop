angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, siteService, cryptoService) {
        $scope.site = {
            folderId: null
        };

        $scope.editSite = function () {
            
        };

        $scope.close = function () {
            $scope.parentScope.closeViewSite();
        };
    });
