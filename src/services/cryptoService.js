function CryptoService() {
    initCryptoService();
};

function initCryptoService() {
    var _key,
        _b64Key,
        _aes;

    CryptoService.prototype.setKey = function (key, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _key = key;
        chrome.storage.local.set({
            'key': sjcl.codec.base64.fromBits(key)
        }, function () {
            callback();
        });
    }

    CryptoService.prototype.getKey = function (b64, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (b64 && b64 === true && _b64Key) {
            return callback(_b64Key);
        }
        else if (!b64 && _key) {
            return callback(_key);
        }

        chrome.storage.local.get('key', function (obj) {
            if (obj && obj.key) {
                _key = sjcl.codec.base64.toBits(obj.key);
            }

            if (b64 && b64 === true) {
                _b64Key = sjcl.codec.base64.fromBits(_key);
                return callback(_b64Key);
            }

            return callback(_key);
        });
    };

    CryptoService.prototype.clearKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _key = _b64Key = _aes = null;
        chrome.storage.local.remove('key', function () {
            callback();
        });
    };

    CryptoService.prototype.makeKey = function (password, salt, b64) {
        var key = sjcl.misc.pbkdf2(password, salt, 5000, 256, null);

        if (b64 && b64 === true) {
            return sjcl.codec.base64.fromBits(key);
        }

        return key;
    };

    CryptoService.prototype.hashPassword = function (password, key, callback) {
        this.getKey(false, function (storedKey) {
            if (!key) {
                key = storedKey;
            }

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = sjcl.misc.pbkdf2(key, password, 1, 256, null);
            callback(sjcl.codec.base64.fromBits(hashBits));
        });
    };

    CryptoService.prototype.getAes = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getKey(false, function (key) {
            if (!_aes && key) {
                _aes = new sjcl.cipher.aes(key);
            }

            callback(_aes);
        });
    };

    CryptoService.prototype.encrypt = function (plaintextValue, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getKey(false, function (key) {
            if (!key) {
                throw 'Encryption key unavailable.';
            }

            var response = {};
            var params = {
                mode: "cbc",
                iv: sjcl.random.randomWords(4, 0)
            };

            var ctJson = sjcl.encrypt(key, plaintextValue, params, response);

            var ct = ctJson.match(/"ct":"([^"]*)"/)[1];
            var iv = sjcl.codec.base64.fromBits(response.iv);

            callback(new CipherString(iv + "|" + ct));
        });
    };

    CryptoService.prototype.decrypt = function (cipherStrin, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getAes(function (aes) {
            if (!aes) {
                throw 'AES encryption unavailable.';
            }

            var ivBits = sjcl.codec.base64.toBits(cipherString.initializationVector);
            var ctBits = sjcl.codec.base64.toBits(cipherString.cipherText);

            var decBits = sjcl.mode.cbc.decrypt(aes, ctBits, ivBits, null);
            callback(sjcl.codec.utf8String.fromBits(decBits));
        });
    };
};
