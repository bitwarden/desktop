angular
    .module('bit.accounts')

    .controller('accountsHintController', function ($scope, $state, apiService, toastr, $q) {
        popupUtils.initListSectionItemListeners();

        $scope.submitPromise = null;
        $scope.submit = function (model) {
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
