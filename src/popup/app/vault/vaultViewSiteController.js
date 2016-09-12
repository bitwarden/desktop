angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, $state, $stateParams, siteService, cipherService) {
        var returnScrollY = $stateParams.returnScrollY;

        $scope.site = null;
        siteService.get($stateParams.siteId, function (site) {
            cipherService.decryptSite(site).then(function (model) {
                $scope.site = model;

                if (model.password) {
                    var maskedPassword = '';
                    for (var i = 0; i < model.password.length; i++) {
                        maskedPassword += '•';
                    }

                    $scope.site.maskedPassword = maskedPassword;
                }
            });
        });

        $scope.close = function () {
            $state.go('tabs.vault', { animation: 'out-slide-down', scrollY: returnScrollY || 0 });
        };
    });
