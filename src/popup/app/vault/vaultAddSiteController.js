angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, $state, $stateParams, siteService, folderService, cryptoService, $q, toastr) {
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;
        var fromCurrent = $stateParams.uri !== null;

        $scope.site = {
            folderId: null,
            name: $stateParams.name,
            uri: $stateParams.uri
        };

        if ($scope.site.name && $scope.site.uri) {
            $('#username').focus();
        }
        else {
            $('#name').focus();
        }
        popupUtils.initListSectionItemListeners();

        $q.when(folderService.getAllDecrypted()).then(function (folders) {
            $scope.folders = folders.concat([{
                id: null,
                name: '(none)'
            }]);
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            $scope.savePromise = $q.when(siteService.encrypt(model)).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return $q.when(siteService.saveWithServer(site)).then(function (site) {
                    toastr.success('Added site');
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            if (fromCurrent) {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
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
