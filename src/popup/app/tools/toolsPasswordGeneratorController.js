angular
    .module('bit.tools')

    .controller('toolsPasswordGeneratorController', function ($scope, $state, $stateParams, passwordGenerationService, toastr, $q) {
        var addState = $stateParams.addState,
            editState = $stateParams.editState;

        $scope.showSelect = $stateParams.addState || $stateParams.editState;

        popupUtils.initListSectionItemListeners();
        $scope.password = '-';

        $scope.slider = {
            value: 12,
            options: {
                floor: 5,
                ceil: 64,
                step: 1,
                hideLimitLabels: true,
                hidePointerLabels: true,
                onChange: function () {
                    $scope.options.length = $scope.slider.value;
                    $scope.regenerate();
                },
                onEnd: function () {
                    $scope.saveOptions($scope.options);
                }
            }
        };

        $q.when(passwordGenerationService.getOptions()).then(function (options) {
            $scope.options = options;
            $scope.slider.value = options.length;
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
            dismiss();
        };

        $scope.select = function () {
            if (addState) {
                addState.site.password = $scope.password;
            }
            else if (editState) {
                editState.site.password = $scope.password;
            }

            dismiss();
        };

        function dismiss() {
            if (addState) {
                $state.go('addSite', {
                    animation: 'out-slide-down',
                    fromCurrent: addState.fromCurrent,
                    site: addState.site,
                    returnScrollY: addState.returnScrollY,
                    returnSearchText: addState.returnSearchText
                });
            }
            else if (editState) {
                $state.go('editSite', {
                    animation: 'out-slide-down',
                    site: editState.site,
                    fromView: editState.fromView,
                    siteId: editState.siteId,
                    returnScrollY: editState.returnScrollY,
                    returnSearchText: editState.returnSearchText
                });
            }
            else {
                $state.go('tabs.tools', {
                    animation: 'out-slide-down'
                });
            }
        }
    });
