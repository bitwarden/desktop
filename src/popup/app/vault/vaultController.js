angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $ionicModal) {
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
