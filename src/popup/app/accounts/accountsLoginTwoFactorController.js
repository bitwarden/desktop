angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, loginService) {
        popupUtils.initListSectionItemListeners();
        $('#code').focus();

        $scope.loginPromise = null;
        $scope.login = function (model) {
            $scope.loginPromise = loginService.logInTwoFactor(model.code);
            $scope.loginPromise.then(function () {
                $state.go('tabs.vault', { animation: 'in-slide-left' });
            });
        };
    });
