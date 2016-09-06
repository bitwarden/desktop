angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $ionicModal, siteService, folderService, $q) {
        $scope.parentScope = $scope;
        $scope.sites = [];
        $scope.folders = [];

        $scope.$on("$ionicView.enter", function (event, data) {
            loadVault();
        });

        function loadVault() {
            $scope.sites = [];
            $scope.folders = [];

            var decSites = [];
            var decFolders = [{
                id: null,
                name: '(none)'
            }];

            folderService.getAll(function (folders) {
                siteService.getAll(function (sites) {
                    var promises = [];

                    for (var i = 0; i < folders.length; i++) {
                        decFolders.push({
                            id: folders[i].id
                        });

                        var folderNamePromise = decrypt(sites[i].name, i);
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

                        var namePromise = decrypt(sites[j].name, j);
                        promises.push(namePromise);
                        namePromise.then(function (obj) {
                            decSites[obj.index].name = obj.val;
                        });

                        var usernamePromise = decrypt(sites[j].username, j);
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

        function decrypt(cipherString, index) {
            return $q(function (resolve, reject) {
                if (!cipherString) {
                    resolve({
                        val: null,
                        index: index
                    });
                }
                else {
                    cipherString.decrypt(function (decString) {
                        resolve({
                            val: decString,
                            index: index
                        });
                    });
                }
            });
        }

        $scope.viewSite = function (site) {
            $ionicModal.fromTemplateUrl('app/vault/views/vaultViewSite.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.viewSiteModal = modal;
                modal.show();
            });
        };

        $scope.editSite = function (site) {
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

        $scope.closeAddSite = function () {
            $scope.addSiteModal.hide();
        };

        $scope.closeViewSite = function () {
            $scope.viewSiteModal.hide();
        };

        $scope.closeEditSite = function () {
            $scope.editSiteModal.hide();
        };

        $scope.$on('modal.hidden', function () {
            console.log('modal hidden');
            loadVault();
        });
    });
