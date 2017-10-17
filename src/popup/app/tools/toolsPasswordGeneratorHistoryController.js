angular
    .module('bit.tools')

    .controller('toolsPasswordGeneratorHistoryController', function (
        $scope, $state, $stateParams, toastr, $analytics, i18nService, passwordGenerationService) {
        $scope.i18n = i18nService;

        $scope.passwords = passwordGenerationService.getHistory();

        $scope.clipboardError = function (e, password) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e) {
            $analytics.eventTrack('Copied Generated Password');
            e.clearSelection();
            toastr.info(i18nService.passwordCopied);
        };

        $scope.close = function () {
            dismiss();
        };

        function dismiss() {
            $state.go('^.passwordGenerator', {
                animation: 'out-slide-right',
                addState: $stateParams.addState,
                editState: $stateParams.editState
            });
        }
    });
