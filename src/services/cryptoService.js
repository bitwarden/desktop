function CryptoService(constantsService) {
    this.constantsService = constantsService;
    initCryptoService();
};

function initCryptoService() {
    var _key,
        _b64Key,
        _keyHash,
        _b64KeyHash,
        _aes,
        _aesWithMac;

    sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

    CryptoService.prototype.setKey = function (key, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        _key = key;

        chrome.storage.local.get(self.constantsService.lockOptionKey, function (obj) {
            if (obj && (obj[self.constantsService.lockOptionKey] || obj[self.constantsService.lockOptionKey] === 0)) {
                // if we have a lock option set, we do not store the key
                callback();
                return;
            }

            chrome.storage.local.set({
                'key': sjcl.codec.base64.fromBits(key)
            }, function () {
                callback();
            });
        });
    }

    CryptoService.prototype.setKeyHash = function (keyHash, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _keyHash = sjcl.codec.base64.toBits(keyHash);

        chrome.storage.local.set({
            'keyHash': keyHash
        }, function () {
            callback();
        });
    }

    CryptoService.prototype.getKey = function (b64, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (b64 && b64 === true && _b64Key) {
            callback(_b64Key);
            return;
        }
        else if (!b64 && _key) {
            callback(_key);
            return;
        }
        else if (b64 && b64 === true && _key && !_b64Key) {
            _b64Key = sjcl.codec.base64.fromBits(_key);
            callback(_b64Key);
            return;
        }

        var self = this;
        chrome.storage.local.get(self.constantsService.lockOptionKey, function (obj) {
            if (obj && (obj[self.constantsService.lockOptionKey] || obj[self.constantsService.lockOptionKey] === 0)) {
                // if we have a lock option set, we do not try to fetch the storage key since it should not even be there
                callback(null);
                return;
            }

            chrome.storage.local.get('key', function (obj) {
                if (obj && obj.key) {
                    _key = sjcl.codec.base64.toBits(obj.key);

                    if (b64 && b64 === true) {
                        _b64Key = obj.key;
                        callback(_b64Key);
                        return;
                    }
                }

                callback(_key);
            });
        });
    };

    CryptoService.prototype.getEncKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getKey(false, function (key) {
            callback(key.slice(0, 4));
        });
    };

    CryptoService.prototype.getMacKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getKey(false, function (key) {
            callback(key.slice(4));
        });
    };

    CryptoService.prototype.getKeyHash = function (b64, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (b64 && b64 === true && _b64KeyHash) {
            callback(_b64KeyHash);
        }
        else if (!b64 && _keyHash) {
            callback(_keyHash);
            return;
        }
        else if (b64 && b64 === true && _keyHash && !_b64KeyHash) {
            _b64KeyHash = sjcl.codec.base64.fromBits(_keyHash);
            callback(_b64KeyHash);
            return;
        }

        chrome.storage.local.get('keyHash', function (obj) {
            if (obj && obj.keyHash) {
                _keyHash = sjcl.codec.base64.toBits(obj.keyHash);

                if (b64 && b64 === true) {
                    _b64KeyHash = obj.keyHash;
                    callback(_b64KeyHash);
                    return;
                }
            }

            callback(_keyHash);
        });
    };

    CryptoService.prototype.clearKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _key = _b64Key = _aes = _aesWithMac = null;
        chrome.storage.local.remove('key', function () {
            callback();
        });
    };

    CryptoService.prototype.clearKeyHash = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _keyHash = _b64KeyHash = null;
        chrome.storage.local.remove('keyHash', function () {
            callback();
        });
    };

    CryptoService.prototype.toggleKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.getKey(false, function (key) {
            chrome.storage.local.get(self.constantsService.lockOptionKey, function (obj) {
                if (obj && (obj[self.constantsService.lockOptionKey] || obj[self.constantsService.lockOptionKey] === 0)) {
                    // if we have a lock option set, clear the key
                    self.clearKey(function () {
                        _key = key;
                        callback();
                        return;
                    });
                }
                else {
                    // no lock option, so store the current key
                    self.setKey(key, function () {
                        callback();
                        return;
                    });
                }
            });
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

    CryptoService.prototype.getAesWithMac = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getEncKey(function (encKey) {
            if (!_aesWithMac && encKey) {
                _aesWithMac = new sjcl.cipher.aes(encKey);
            }

            callback(_aesWithMac);
        });
    };

    CryptoService.prototype.encrypt = function (plaintextValue) {
        var self = this;
        var deferred = Q.defer();

        if (plaintextValue === null || plaintextValue === undefined) {
            deferred.resolve(null);
        }
        else {
            self.getKey(false, function (key) {
                self.getEncKey(function (theEncKey) {
                    self.getMacKey(function (macKey) {
                        if (!key || !theEncKey || !macKey) {
                            throw 'Encryption key unavailable.';
                        }

                        // TODO: Turn on whenever ready to support encrypt-then-mac
                        var encKey = false ? theEncKey : key;

                        var response = {};
                        var params = {
                            mode: 'cbc',
                            iv: sjcl.random.randomWords(4, 10)
                        };

                        var ctJson = sjcl.encrypt(encKey, plaintextValue, params, response);

                        var ct = ctJson.match(/"ct":"([^"]*)"/)[1];
                        var iv = sjcl.codec.base64.fromBits(response.iv);

                        var cipherString = iv + '|' + ct;

                        // TODO: Turn on whenever ready to support encrypt-then-mac
                        if (false) {
                            var mac = computeMac(ct, response.iv, macKey);
                            cipherString = cipherString + '|' + mac;
                        }

                        var cs = new CipherString(cipherString);
                        deferred.resolve(cs);
                    });
                });
            });
        }

        return deferred.promise;
    };

    CryptoService.prototype.decrypt = function (cipherString) {
        var deferred = Q.defer();
        var self = this;

        if (cipherString === null || cipherString === undefined || !cipherString.encryptedString) {
            throw 'cannot decrypt nothing';
        }

        self.getMacKey(function (macKey) {
            if (!macKey) {
                throw 'MAC key unavailable.';
            }

            self.getAes(function (aes) {
                self.getAesWithMac(function (aesWithMac) {
                    if (!aes || !aesWithMac) {
                        throw 'AES encryption unavailable.';
                    }

                    var ivBits = sjcl.codec.base64.toBits(cipherString.initializationVector);
                    var ctBits = sjcl.codec.base64.toBits(cipherString.cipherText);

                    var computedMac = null;
                    if (cipherString.mac) {
                        computedMac = computeMac(ctBits, ivBits, macKey);
                        if (computedMac !== cipherString.mac) {
                            console.error('MAC failed.');
                            deferred.reject('MAC failed.');
                        }
                    }

                    var decBits = sjcl.mode.cbc.decrypt(computedMac ? aesWithMac : aes, ctBits, ivBits, null);
                    var decValue = sjcl.codec.utf8String.fromBits(decBits);
                    deferred.resolve(decValue);
                });
            });
        });

        return deferred.promise;
    };

    function computeMac(ct, iv, macKey) {
        if (typeof ct === 'string') {
            ct = sjcl.codec.base64.toBits(ct);
        }
        if (typeof iv === 'string') {
            iv = sjcl.codec.base64.toBits(iv);
        }

        var hmac = new sjcl.misc.hmac(macKey, sjcl.hash.sha256);
        var bits = iv.concat(ct);
        var mac = hmac.encrypt(bits);
        return sjcl.codec.base64.fromBits(mac);
    }
};
