angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, $state, $stateParams, siteService, folderService, cipherService, $q) {
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

        var promises = [];
        var decFolders = [{
            id: null,
            name: '(none)'
        }];

        folderService.getAll(function (folders) {
            for (var i = 1; i < folders.length; i++) {
                decFolders.push({
                    id: folders[i].id
                });

                var folderNamePromise = cipherService.decrypt(folders[i].name, i);
                promises.push(folderNamePromise);
                folderNamePromise.then(function (obj) {
                    decFolders[obj.index].name = obj.val;
                });
            }

            $q.all(promises).then(function () {
                $scope.folders = decFolders;
            });
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            $scope.savePromise = cipherService.encryptSite(model).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return saveSite(site).then(function (site) {
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
