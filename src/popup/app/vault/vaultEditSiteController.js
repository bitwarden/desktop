angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, $state, $stateParams, siteService, folderService, cryptoService, $q, toastr) {
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;

        $scope.site = {
            folderId: null
        };

        siteService.get($stateParams.siteId, function (site) {
            $q.when(site.decrypt()).then(function (model) {
                $scope.site = model;
            });
        });

        $q.when(folderService.getAllDecrypted()).then(function (folders) {
            $scope.folders = folders.concat([{
                id: null,
                name: '(none)'
            }]);
        });

        popupUtils.initListSectionItemListeners();

        $scope.savePromise = null;
        $scope.save = function (model) {
            $scope.savePromise = $q.when(siteService.encrypt(model)).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return $q.when(siteService.saveWithServer(site)).then(function (site) {
                    toastr.success('Edited site');
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            if ($stateParams.fromView) {
                $state.go('viewSite', {
                    siteId: $stateParams.siteId,
                    animation: 'out-slide-down',
                    returnScrollY: returnScrollY || 0,
                    returnSearchText: returnSearchText
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down',
                    scrollY: returnScrollY || 0,
                    searchText: returnSearchText
                });
            }
        };
    });
