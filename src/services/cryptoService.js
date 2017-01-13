function CryptoService(constantsService) {
    this.constantsService = constantsService;
    initCryptoService();
};

function initCryptoService() {
    var _key,
        _b64Key,
        _keyHash,
        _b64KeyHash,
        _encKey,
        _macKey;

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
                'key': forge.util.encode64(key)
            }, function () {
                callback();
            });
        });
    }

    CryptoService.prototype.setKeyHash = function (keyHash, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _keyHash = forge.util.encode64(keyHash);

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
            _b64Key = forge.util.encode64(_key);
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
                    _key = forge.util.decode64(obj.key);

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

        if (_encKey) {
            callback(_encKey);
        }

        this.getKey(false, function (key) {
            var buffer = forge.util.createBuffer(key);
            _encKey = buffer.getBytes(16);
            callback(_encKey);
        });
    };

    CryptoService.prototype.getMacKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_macKey) {
            callback(_macKey);
        }

        this.getKey(false, function (key) {
            var buffer = forge.util.createBuffer(key);
            buffer.getBytes(16);
            _macKey = buffer.getBytes(16);
            callback(_macKey);
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
            _b64KeyHash = forge.util.encode64(_keyHash);
            callback(_b64KeyHash);
            return;
        }

        chrome.storage.local.get('keyHash', function (obj) {
            if (obj && obj.keyHash) {
                _keyHash = forge.util.decode64(obj.keyHash);

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

        _key = _b64Key = _macKey = _encKey = null;
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
        var key = forge.pbkdf2(password, salt, 5000, 256 / 8, 'sha256');

        if (b64 && b64 === true) {
            return forge.util.encode64(key);
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

            var hashBits = forge.pbkdf2(key, password, 1, 256 / 8, 'sha256');
            callback(forge.util.encode64(hashBits));
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

                        var buffer = forge.util.createBuffer(plaintextValue, 'utf8');
                        var ivBytes = forge.random.getBytesSync(16);
                        var cipher = forge.cipher.createCipher('AES-CBC', encKey);
                        cipher.start({ iv: ivBytes });
                        cipher.update(buffer);
                        cipher.finish();

                        var iv = forge.util.encode64(ivBytes);
                        var ctBytes = cipher.output.getBytes();
                        var ct = forge.util.encode64(ctBytes);
                        var cipherString = iv + '|' + ct;

                        // TODO: Turn on whenever ready to support encrypt-then-mac
                        if (false) {
                            var mac = computeMac(ctBytes, ivBytes, macKey);
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

        self.getKey(false, function (key) {
            self.getEncKey(function (theEncKey) {
                self.getMacKey(function (macKey) {
                    if (!macKey) {
                        throw 'MAC key unavailable.';
                    }

                    var ivBytes = forge.util.decode64(cipherString.initializationVector);
                    var ctBytes = forge.util.decode64(cipherString.cipherText);

                    var computedMac = null;
                    if (cipherString.mac) {
                        computedMac = computeMac(ctBytes, ivBytes, macKey);
                        if (computedMac !== cipherString.mac) {
                            console.error('MAC failed.');
                            deferred.reject('MAC failed.');
                        }
                    }

                    var ctBuffer = forge.util.createBuffer(ctBytes);
                    var decipher = forge.cipher.createDecipher('AES-CBC', computedMac ? theEncKey : key);
                    decipher.start({ iv: ivBytes });
                    decipher.update(ctBuffer);
                    decipher.finish();

                    var decValue = decipher.output.toString('utf8');
                    deferred.resolve(decValue);
                });
            });
        });

        return deferred.promise;
    };

    function computeMac(ct, iv, macKey) {
        var hmac = forge.hmac.create();
        hmac.start('sha256', macKey);
        hmac.update(iv + ct);
        var mac = hmac.digest();
        return forge.util.encode64(mac.getBytes());
    }
};
