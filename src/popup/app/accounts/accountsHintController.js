angular
    .module('bit.accounts')

    .controller('accountsHintController', function ($scope, $state, apiService, toastr, $q) {
        popupUtils.initListSectionItemListeners();
        $('#email').focus();

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            if (!model.email) {
                toastr.error('Email is required.');
                return;
            }

            var request = new PasswordHintRequest(model.email);
            $scope.submitPromise = hintPromise(request);
            $scope.submitPromise.then(function () {
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
