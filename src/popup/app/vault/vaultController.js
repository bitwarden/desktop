angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('app/vault/views/vaultAddSite.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.addSiteModal = modal;
        });

        $scope.addSite = function () {
            $scope.addSiteModal.show();
        };

        $scope.closeAddSite = function () {
            $scope.addSiteModal.hide();
        };

        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.addSiteModal.remove();
        });

        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });

        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
    });
