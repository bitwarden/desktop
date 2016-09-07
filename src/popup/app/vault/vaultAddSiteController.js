angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, siteService, cipherService) {
        $scope.site = {
            folderId: null
        };

        $scope.createSite = function (model) {
            cipherService.encryptSite(model, function (siteModel) {
                var site = new Site(siteModel, true);
                siteService.saveWithServer(site, function () {
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            $scope.parentScope.closeAddSite();
        };
    });
