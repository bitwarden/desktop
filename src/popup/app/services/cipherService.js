angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, $q) {
        var _service = {};

        _service.encryptSite = function (site) {
            var model = {
                id: site.id,
                folderId: site.folderId,
                favorite: site.favorite
            };

            return $q(function (resolve, reject) {
                encrypt(site.name).then(function (cs) {
                    model.name = cs;
                    return encrypt(site.uri);
                }).then(function (cs) {
                    model.uri = cs;
                    return encrypt(site.username);
                }).then(function (cs) {
                    model.username = cs;
                    return encrypt(site.password);
                }).then(function (cs) {
                    model.password = cs;
                    return encrypt(site.notes);
                }).then(function (cs) {
                    model.notes = cs;
                    resolve(model);
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

        function encrypt(plaintextString) {
            return $q(function (resolve, reject) {
                cryptoService.encrypt(plaintextString, function (cipherString) {
                    resolve(cipherString);
                });
            });
        }

        return _service;
    });
