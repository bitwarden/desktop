angular
    .module('bit.services')

    .factory('cipherService', function ($q, siteService) {
        var _service = {};

        _service.encryptSite = function (site) {
            return $q.when(siteService.encrypt(site));
        };

        _service.decryptSite = function (site) {
            return $q.when(site.decrypt());
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
