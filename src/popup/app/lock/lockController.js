angular
    .module('bit.lock')

    .controller('lockController', function ($scope, $state, $analytics, i18nService, cryptoService, toastr,
        userService, SweetAlert, $timeout) {
        $scope.i18n = i18nService;

        $timeout(function () {
            $('#master-password').focus();
        });

        $scope.logOut = function () {
            SweetAlert.swal({
                title: i18nService.logOut,
                text: i18nService.logOutConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                if (confirmed) {
                    chrome.runtime.sendMessage({ command: 'logout' });
                }
            });
        };

        $scope.submit = function () {
            userService.getEmail().then(function (email) {
                var key = cryptoService.makeKey($scope.masterPassword, email);
                var keyHash;
                cryptoService.hashPassword($scope.masterPassword, key).then(function (theKeyHash) {
                    keyHash = theKeyHash;
                    return cryptoService.getKeyHash();
                }).then(function (storedKeyHash) {
                    if (storedKeyHash && keyHash && storedKeyHash === keyHash) {
                        cryptoService.setKey(key).then(function () {
                            chrome.runtime.sendMessage({ command: 'unlocked' });
                            $state.go('tabs.current');
                        });
                    }
                    else {
                        toastr.error(i18nService.invalidMasterPassword, i18nService.errorsOccurred);
                    }
                });
            });
        };
    });
