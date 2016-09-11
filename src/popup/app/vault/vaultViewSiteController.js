angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, $stateParams, siteService, cipherService) {
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
    });
