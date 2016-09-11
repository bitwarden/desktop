angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, $state, $stateParams, siteService, cipherService, $q) {
        $scope.site = {
            folderId: null
        };

        siteService.get($stateParams.siteId, function (site) {
            cipherService.decryptSite(site).then(function (model) {
                $scope.site = model;
            });
        });

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
            if ($stateParams.fromView) {
                $state.go('viewSite', { siteId: $stateParams.siteId, animation: 'out-slide-down' });
            }
            else {
                $state.go('tabs.vault', { animation: 'out-slide-down' });
            }
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
