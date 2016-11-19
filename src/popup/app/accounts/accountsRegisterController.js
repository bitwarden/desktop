angular
    .module('bit.accounts')

    .controller(
      'accountsRegisterController',
      function ($scope, $state, cryptoService, toastr, $q, apiService, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;

        $scope.model = {};
        utilsService.initListSectionItemListeners($(document), angular);
        $('#email').focus();

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            if (!model.email) {
                toastr.error(i18nService.emailRequired, i18nService.errorsOccurred);
                return;
            }
            if (model.email.indexOf('@') === -1) {
                toastr.error(i18nService.invalidEmail, i18nService.errorsOccurred);
                return;
            }
            if (!model.masterPassword) {
                toastr.error(i18nService.masterPassRequired, i18nService.errorsOccurred);
                return;
            }
            if (model.masterPassword.length < 8) {
                toastr.error(i18nService.masterPassLength, i18nService.errorsOccurred);
                return;
            }
            if (model.masterPassword !== model.masterPasswordRetype) {
                toastr.error(i18nService.masterPassDoesntMatch, i18nService.errorsOccurred);
                return;
            }

            var email = model.email.toLowerCase();
            var key = cryptoService.makeKey(model.masterPassword, email);
            $scope.submitPromise = registerPromise(key, model.masterPassword, email, model.hint);
            $scope.submitPromise.then(function () {
                $analytics.eventTrack('Registered');
                toastr.success(i18nService.newAccountCreated);
                $state.go('login', { email: email, animation: 'in-slide-left' });
            });
        };

        function registerPromise(key, masterPassword, email, hint) {
            return $q(function (resolve, reject) {
                cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                    var request = new RegisterRequest(email, hashedPassword, hint);
                    apiService.postRegister(request,
                        function () {
                            resolve();
                        },
                        function (error) {
                            reject(error);
                        });
                });
            });
        }
    });
