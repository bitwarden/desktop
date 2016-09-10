angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, siteService, folderService, $q, cipherService) {
        var delayLoad = true;
        if (!$rootScope.vaultSites) {
            $rootScope.vaultSites =[];
            delayLoad = false;
        }
        if (!$rootScope.vaultFolders) {
            $rootScope.vaultFolders = [];
            delayLoad = false;
        }

        if (delayLoad) {
            setTimeout(loadVault, 1000);
        }
        else {
            loadVault();
        }

        function loadVault() {
            var promises = [];
            var decSites = [];
            var decFolders = [{
                id: null,
                name: '(none)'
            }];

            folderService.getAll(function (folders) {
                siteService.getAll(function (sites) {
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
                        $rootScope.vaultSites = decSites;
                        $rootScope.vaultFolders = decFolders;
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
    });
