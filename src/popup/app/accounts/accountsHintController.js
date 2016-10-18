angular
    .module('bit.accounts')

    .controller('accountsHintController', function ($scope, $state, apiService, toastr, $q, utilsService,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.model = {};

        utilsService.initListSectionItemListeners($(document), angular);
        $('#email').focus();

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            if (!model.email) {
                toastr.error('Email address is required.', 'Errors have occurred');
                return;
            }
            if (model.email.indexOf('@') === -1) {
                toastr.error('Invalid email address.', 'Errors have occurred');
                return;
            }

            var request = new PasswordHintRequest(model.email);
            $scope.submitPromise = hintPromise(request);
            $scope.submitPromise.then(function () {
                $analytics.eventTrack('Requested Hint');
                toastr.success('We\'ve sent you an email with your master password hint.');
                $state.go('login');
            });
        };

        function hintPromise(request) {
            return $q(function (resolve, reject) {
                apiService.postPasswordHint(request,
                    function () {
                        resolve();
                    },
                    function (error) {
                        reject(error);
                    });
            });
        }
    });
