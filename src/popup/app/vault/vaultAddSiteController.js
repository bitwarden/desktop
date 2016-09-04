angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, siteService, cryptoService) {
        $scope.site = {
            folderId: null
        };

        $scope.createSite = function (model) {
            var newModel = model;
            encryptSite(newModel, function (siteModel) {
                var site = new Site(siteModel, true);
                siteService.save(site, function () {
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            $scope.parentScope.closeAddSite();
        };

        function encryptSite(siteModel, callback) {
            cryptoService.encrypt(siteModel.name, function (nameCipherString) {
                siteModel.name = nameCipherString;
                cryptoService.encrypt(siteModel.uri, function (uriCipherString) {
                    siteModel.uri = uriCipherString;
                    cryptoService.encrypt(siteModel.username, function (usernameCipherString) {
                        siteModel.username = usernameCipherString;
                        cryptoService.encrypt(siteModel.password, function (passwordCipherString) {
                            siteModel.password = passwordCipherString;
                            cryptoService.encrypt(siteModel.notes, function (notesCipherString) {
                                siteModel.notes = notesCipherString;
                                callback(siteModel);
                            });
                        });
                    });
                });
            });
        }
    });
