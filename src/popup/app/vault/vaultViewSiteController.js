angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, siteService, cipherService) {
        $scope.site = null;
        siteService.get($scope.parentScope.focusedSiteId, function (site) {
            cipherService.decryptSite(site).then(function (model) {
                $scope.site = model;
            });
        });

        $scope.editSite = function () {
            // TODO
        };

        $scope.close = function () {
            $scope.parentScope.closeViewSite();
        };
    });
