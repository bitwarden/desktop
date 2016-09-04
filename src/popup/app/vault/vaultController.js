angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $ionicModal, siteService, folderService) {
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
                for (var i = 0; i < folders.length; i++) {
                    decFolders.push({
                        id: folders[i].id,
                        name: folders[i].name.decrypt()
                    });
                }

                for (var j = 0; j < sites.length; j++) {
                    decSites.push({
                        id: sites[j].id,
                        folderId: sites[j].folderId,
                        favorite: sites[j].favorite,
                        name: sites[j].name.decrypt(),
                        username: sites[j].username.decrypt()
                    });
                }

                $scope.sites = decSites;
                $scope.folders = decFolders;
            });
        });

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
