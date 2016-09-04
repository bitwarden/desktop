angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, siteService) {
        $scope.site = {
            folderId: null
        };
        $scope.createSite = function (model) {
            var site = new Site(model);
            siteService.save(model, function () {

            });
        };
    });
