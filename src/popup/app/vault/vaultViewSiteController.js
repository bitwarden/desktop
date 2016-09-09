angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, $stateParams, siteService, cipherService) {
        $scope.site = null;
        siteService.get($stateParams.siteId, function (site) {
            cipherService.decryptSite(site).then(function (model) {
                $scope.site = model;
            });
        });
    });
