angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, $state, $stateParams, siteService, folderService, cipherService, $q, toastr) {
        var returnScrollY = $stateParams.returnScrollY;

        $scope.site = {
            folderId: null
        };

        siteService.get($stateParams.siteId, function (site) {
            cipherService.decryptSite(site).then(function (model) {
                $scope.site = model;
            });
        });

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

        popupUtils.initListSectionItemListeners();

        $scope.savePromise = null;
        $scope.save = function (model) {
            $scope.savePromise = cipherService.encryptSite(model).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return site;
            }).then(function (site) {
                return saveSite(site).then(function (site) {
                    toastr.success('Edited site');
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            if ($stateParams.fromView) {
                $state.go('viewSite', { siteId: $stateParams.siteId, animation: 'out-slide-down' });
            }
            else {
                $state.go('tabs.vault', { animation: 'out-slide-down', scrollY: returnScrollY || 0 });
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
