angular
    .module('bit.accounts')

    .controller(
    'accountsRegisterController',
    function ($scope, $state, cryptoService, toastr, $q, apiService, popupUtilsService, $analytics,
        i18nService, $timeout) {
        $timeout(function () {
            popupUtilsService.initListSectionItemListeners(document, angular);
            document.getElementById('email').focus();
        }, 500);

        $scope.i18n = i18nService;
        $scope.model = {};
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
            var deferred = $q.defer();
            var encKey;
            cryptoService.makeEncKey(key).then(function (theEncKey) {
                encKey = theEncKey;
                return cryptoService.hashPassword(masterPassword, key);
            }).then(function (hashedPassword) {
                var request = new RegisterRequest(email, hashedPassword, hint, encKey.encryptedString);
                apiService.postRegister(request).then(function () {
                    deferred.resolve();
                }, function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        }
    });
