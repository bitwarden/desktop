function CryptoService() {

};

!function () {
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

        chrome.storage.local.get('key', function (key) {
            if (key) {
                _key = sjcl.codec.base64.toBits(key);
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

    CryptoService.prototype.hashPassword = function (password, key) {
        if (!key) {
            key = this.getKey();
        }

        if (!password || !key) {
            throw 'Invalid parameters.';
        }

        var hashBits = sjcl.misc.pbkdf2(key, password, 1, 256, null);
        return sjcl.codec.base64.fromBits(hashBits);
    };

    CryptoService.prototype.getAes = function () {
        if (!_aes && this.getKey()) {
            _aes = new sjcl.cipher.aes(this.getKey());
        }

        return _aes;
    };

    CryptoService.prototype.encrypt = function (plaintextValue, key) {
        if (!this.getKey() && !key) {
            throw 'Encryption key unavailable.';
        }

        if (!key) {
            key = this.getKey();
        }

        var response = {};
        var params = {
            mode: "cbc",
            iv: sjcl.random.randomWords(4, 0)
        };

        var ctJson = sjcl.encrypt(key, plaintextValue, params, response);

        var ct = ctJson.match(/"ct":"([^"]*)"/)[1];
        var iv = sjcl.codec.base64.fromBits(response.iv);

        return iv + "|" + ct;
    };

    CryptoService.prototype.decrypt = function (encValue) {
        if (!this.getAes()) {
            throw 'AES encryption unavailable.';
        }

        var encPieces = encValue.split('|');
        if (encPieces.length !== 2) {
            return '';
        }

        var ivBits = sjcl.codec.base64.toBits(encPieces[0]);
        var ctBits = sjcl.codec.base64.toBits(encPieces[1]);

        var decBits = sjcl.mode.cbc.decrypt(this.getAes(), ctBits, ivBits, null);
        return sjcl.codec.utf8String.fromBits(decBits);
    };
}();
