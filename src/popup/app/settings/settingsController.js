angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, loginService, $state, SweetAlert, utilsService) {
        $scope.logOut = function () {
            SweetAlert.swal({
                title: 'Log Out',
                text: 'Are you sure you want to log out?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, function (confirmed) {
                if (confirmed) {
                    loginService.logOut(function () {
                        $state.go('home');
                    });
                }
            });
        };

        $scope.changePassword = function () {
            SweetAlert.swal({
                title: 'Change Master Password',
                text: 'You can change your master password on the bitwarden.com web vault. Do you want to visit the website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, alertCallback);
        };

        $scope.changeEmail = function () {
            SweetAlert.swal({
                title: 'Change Email',
                text: 'You can change your email address on the bitwarden.com web vault. Do you want to visit the website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, alertCallback);
        };

        $scope.twoStep = function () {
            SweetAlert.swal({
                title: 'Two-step Login',
                text: 'Two-step login makes your account more secure by requiring you to enter a security code from an authenticator app whenever you log in. Two-step login can be enabled on the bitwarden.com web vault. Do you want to visit the website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, alertCallback);
        };

        function alertCallback(confirmed) {
            if (confirmed) {
                chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
            }
        }

        $scope.rate = function () {
            switch (utilsService.getBrowser()) {
                case 'chrome':
                    chrome.tabs.create({ url: 'https://chrome.com' });
                    break;
                case 'firefox':
                    chrome.tabs.create({ url: 'https://firefox.com' });
                    break;
                case 'edge':
                    chrome.tabs.create({ url: 'https://microsoft.com' });
                    break;
                case 'opera':
                    chrome.tabs.create({ url: 'https://opera.com' });
                    break;
                default:
                    return;
            }
            
        };
    });
