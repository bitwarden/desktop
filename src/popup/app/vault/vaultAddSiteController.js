angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, $state, siteService, cipherService) {
        $scope.site = {
            folderId: null
        };

        $scope.save = function (model) {
            cipherService.encryptSite(model, function (siteModel) {
                var site = new Site(siteModel, true);
                siteService.saveWithServer(site, function () {
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            $state.go('tabs.vault', { animation: 'out-slide-down' });
        };
    });
