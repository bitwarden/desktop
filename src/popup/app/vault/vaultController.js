angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, siteService, folderService, $q, cipherService) {
        $scope.sites = [];
        $scope.folders = [];
        $scope.focusedSiteId = null;

        loadVault();

        function loadVault() {
            var decSites = [];
            var decFolders = [{
                id: null,
                name: '(none)'
            }];

            folderService.getAll(function (folders) {
                siteService.getAll(function (sites) {
                    var promises = [];

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

                    for (var j = 0; j < sites.length; j++) {
                        decSites.push({
                            id: sites[j].id,
                            folderId: sites[j].folderId,
                            favorite: sites[j].favorite
                        });

                        var namePromise = cipherService.decrypt(sites[j].name, j);
                        promises.push(namePromise);
                        namePromise.then(function (obj) {
                            decSites[obj.index].name = obj.val;
                        });

                        var usernamePromise = cipherService.decrypt(sites[j].username, j);
                        promises.push(usernamePromise);
                        usernamePromise.then(function (obj) {
                            decSites[obj.index].username = obj.val;
                        });
                    }

                    $q.all(promises).then(function () {
                        $scope.sites = decSites;
                        $scope.folders = decFolders;
                    });
                });
            });
        }

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        /*
        $scope.editSite = function (site) {
            $scope.focusedSiteId = site.id;
            $ionicModal.fromTemplateUrl('app/vault/views/vaultEditSite.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.editSiteModal = modal;
                modal.show();
            });
        };

        $scope.addSite = function () {
            $ionicModal.fromTemplateUrl('app/vault/views/vaultAddSite.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.addSiteModal = modal;
                modal.show();
            });
        };
        */

        $scope.closeAddSite = function () {
            $scope.addSiteModal.hide();
        };

        $scope.closeViewSite = function () {
            $scope.viewSiteModal.hide();
            $scope.focusedSiteId = null;
        };

        $scope.closeEditSite = function () {
            $scope.editSiteModal.hide();
            $scope.focusedSiteId = null;
        };

        $scope.$on('closeViewSite.hidden', function () {
            console.log('modal hidden');
            loadVault();
        });
    });
