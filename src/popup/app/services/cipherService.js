angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, $q) {
        var _service = {};

        _service.encryptSite = function (site, callback) {
            var model = {};

            cryptoService.encrypt(site.name, function (nameCipherString) {
                model.name = nameCipherString;
                cryptoService.encrypt(site.uri, function (uriCipherString) {
                    model.uri = uriCipherString;
                    cryptoService.encrypt(site.username, function (usernameCipherString) {
                        model.username = usernameCipherString;
                        cryptoService.encrypt(site.password, function (passwordCipherString) {
                            model.password = passwordCipherString;
                            cryptoService.encrypt(site.notes, function (notesCipherString) {
                                model.notes = notesCipherString;
                                callback(model);
                            });
                        });
                    });
                });
            });
        };

        _service.decryptSite = function (site) {
            var model = {
                id: site.id,
                folderId: site.folderId,
                favorite: site.favorite
            };

            return $q(function (resolve, reject) {
                decrypt(site.name).then(function (obj) {
                    model.name = obj.val;
                    return decrypt(site.uri);
                }).then(function (obj) {
                    model.uri = obj.val;
                    return decrypt(site.username);
                }).then(function (obj) {
                    model.username = obj.val;
                    return decrypt(site.password);
                }).then(function (obj) {
                    model.password = obj.val;
                    return decrypt(site.notes);
                }).then(function (obj) {
                    model.notes = obj.val;
                    resolve(model);
                });
            });
        };

        _service.decrypt = decrypt;

        function decrypt(cipherString, index) {
            return $q(function (resolve, reject) {
                if (!cipherString) {
                    resolve({
                        val: null,
                        index: index
                    });
                }
                else {
                    cipherString.decrypt(function (decVal) {
                        resolve({
                            val: decVal,
                            index: index
                        });
                    });
                }
            });
        }

        return _service;
    });
