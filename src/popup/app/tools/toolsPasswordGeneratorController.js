angular
    .module('bit.tools')

    .controller('toolsPasswordGeneratorController', function ($scope, $state, $stateParams, passwordGenerationService, toastr, $q) {
        var addState = $stateParams.addState,
            editState = $stateParams.editState;

        popupUtils.initListSectionItemListeners();
        $scope.password = '-';

        $q.when(passwordGenerationService.getOptions()).then(function (options) {
            $scope.options = options;
            $scope.regenerate();
        });

        $scope.regenerate = function () {
            $scope.password = passwordGenerationService.generatePassword($scope.options);
        };

        $scope.saveOptions = function (options) {
            if (!options.uppercase && !options.lowercase && !options.number && !options.special) {
                options.lowercase = $scope.options.lowercase = true;
            }
            if (!options.minNumber) {
                options.minNumber = $scope.options.minNumber = 0;
            }
            if (!options.minSpecial) {
                options.minSpecial = $scope.options.minSpecial = 0;
            }

            passwordGenerationService.saveOptions(options);
            $scope.regenerate();
        };

        $scope.clipboardError = function (e, password) {
            toastr.info('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            toastr.info('Password copied!');
        };

        $scope.close = function () {
            if (addState) {
                $state.go('addSite', {
                    animation: 'out-slide-down',
                    site: addState
                });
            }
            else if (editState) {
                $state.go('editSite', {
                    animation: 'out-slide-down',
                    siteId: editState
                });
            }
            else {
                $state.go('tabs.tools', {
                    animation: 'out-slide-down'
                });
            }
        };
    });
