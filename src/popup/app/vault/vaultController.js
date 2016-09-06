angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $ionicModal, siteService, folderService, $q) {
        $scope.parentScope = $scope;
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

                    promises.push(decrypt(folders[j].name, i).then(function (obj) {
                        decFolders[obj.index].name = obj.val;
                    }));
                }

                for (var j = 0; j < sites.length; j++) {
                    decSites.push({
                        id: sites[j].id,
                        folderId: sites[j].folderId,
                        favorite: sites[j].favorite
                    });

                    promises.push(decrypt(sites[j].name, j).then(function (obj) {
                        decSites[obj.index].name = obj.val;
                    }));

                    promises.push(decrypt(sites[j].username, j).then(function (obj) {
                        decSites[obj.index].username = obj.val;
                    }));
                }

                $q.all(promises).then(function () {
                    $scope.sites = decSites;
                    $scope.folders = decFolders;
                });
            });
        });

        function decrypt(cipherString, index) {
            return $q(function(resolve, reject) {
                if (!cipherString) {
                    resolve({val: null, index: index});
                }
                else {
                    cipherString.decrypt(function (decString) {
                        resolve({ val: decString, index: index });
                    });
                }
            });
        }

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

        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            console.log('modal destroyed');
            $scope.addSiteModal.remove();
        });

        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            console.log('modal hidden');
            // Execute action
        });

        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            console.log('modal removed');
            // Execute action
        });
    });
