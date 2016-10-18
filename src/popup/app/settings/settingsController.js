angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, loginService, $state, SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
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
                        $analytics.eventTrack('Logged Out');
                        $state.go('home');
                    });
                }
            });
        };

        $scope.changePassword = function () {
            SweetAlert.swal({
                title: 'Change Master Password',
                text: 'You can change your master password on the bitwarden.com web vault. Do you want to visit the ' +
                      'website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Change Password');
                alertCallback(confirmed);
            });
        };

        $scope.changeEmail = function () {
            SweetAlert.swal({
                title: 'Change Email',
                text: 'You can change your email address on the bitwarden.com web vault. Do you want to visit the ' +
                      'website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Change Email');
                alertCallback(confirmed);
            });
        };

        $scope.twoStep = function () {
            SweetAlert.swal({
                title: 'Two-step Login',
                text: 'Two-step login makes your account more secure by requiring you to enter a security code from an ' +
                      'authenticator app whenever you log in. Two-step login can be enabled on the bitwarden.com web vault. ' +
                      'Do you want to visit the website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Two-step Login');
                alertCallback(confirmed);
            });
        };

        function alertCallback(confirmed) {
            if (confirmed) {
                chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
            }
        }

        $scope.rate = function () {
            $analytics.eventTrack('Rate Extension');

            switch (utilsService.getBrowser()) {
                case 'chrome':
                    chrome.tabs.create({
                        url: 'https://chrome.google.com/webstore/detail/bitwarden-free-password-m/' +
                             'nngceckbapebfimnlniiiahkandclblb/reviews'
                    });
                    break;
                case 'firefox':
                    chrome.tabs.create({
                        url: 'https://addons.mozilla.org/en-US/firefox/addon/' +
                             'bitwarden-password-manager/#reviews'
                    });
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
