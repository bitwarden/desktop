angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, siteService, cryptoService) {
        $scope.site = {
            folderId: null
        };

        $scope.createSite = function (model) {
            encryptSite(model, function (siteModel) {
                var site = new Site(siteModel, true);
                siteService.save(site, function () {
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            $scope.parentScope.closeAddSite();
        };

        function encryptSite(model, callback) {
            var siteModel = {};
            cryptoService.encrypt(model.name, function (nameCipherString) {
                siteModel.name = nameCipherString;
                cryptoService.encrypt(model.uri, function (uriCipherString) {
                    siteModel.uri = uriCipherString;
                    cryptoService.encrypt(model.username, function (usernameCipherString) {
                        siteModel.username = usernameCipherString;
                        cryptoService.encrypt(model.password, function (passwordCipherString) {
                            siteModel.password = passwordCipherString;
                            cryptoService.encrypt(model.notes, function (notesCipherString) {
                                siteModel.notes = notesCipherString;
                                callback(siteModel);
                            });
                        });
                    });
                });
            });
        }
    });
