angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, $state, siteService, cipherService, $q) {
        $scope.site = {
            folderId: null
        };

        $('#name').focus();
        popupUtils.initListSectionItemListeners();

        $scope.savePromise = null;
        $scope.save = function (model) {
            $scope.savePromise = cipherService.encryptSite(model).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return site;
            }).then(function (site) {
                return saveSite(site, function (site) {
                    alert('Saved ' + site.id + '!');
                });
            });
        };

        $scope.close = function () {
            $state.go('tabs.vault', { animation: 'out-slide-down' });
        };

        function saveSite(site) {
            return $q(function (resolve, reject) {
                siteService.saveWithServer(site, function (site) {
                    resolve(site);
                }, function (error) {
                    reject(error);
                });
            });
        }
    });
