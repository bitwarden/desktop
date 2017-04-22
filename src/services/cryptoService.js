function CryptoService(constantsService) {
    this.constantsService = constantsService;
    initCryptoService(constantsService);
};

function initCryptoService(constantsService) {
    var _key,
        _legacyEtmKey,
        _keyHash,
        _b64KeyHash;

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
                'key': key.keyB64
            }, function () {
                callback();
            });
        });
    }

    CryptoService.prototype.setKeyHash = function (keyHash, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _keyHash = keyHash;

        chrome.storage.local.set({
            'keyHash': _keyHash
        }, function () {
            callback();
        });
    }

    CryptoService.prototype.getKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_key) {
            callback(_key);
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
                    _key = new CryptoKey(obj.key, true);
                }

                callback(_key);
            });
        });
    };

    CryptoService.prototype.getKeyHash = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_keyHash) {
            callback(_keyHash);
            return;
        }

        chrome.storage.local.get('keyHash', function (obj) {
            if (obj && obj.keyHash) {
                _keyHash = obj.keyHash;
            }

            callback(_keyHash);
        });
    };

    CryptoService.prototype.clearKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _key = _legacyEtmKey = null;
        chrome.storage.local.remove('key', function () {
            callback();
        });
    };

    CryptoService.prototype.clearKeyHash = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _keyHash = null;
        chrome.storage.local.remove('keyHash', function () {
            callback();
        });
    };

    CryptoService.prototype.toggleKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.getKey(function (key) {
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

    CryptoService.prototype.makeKey = function (password, salt) {
        var keyBytes = forge.pbkdf2(forge.util.encodeUtf8(password), forge.util.encodeUtf8(salt),
            5000, 256 / 8, 'sha256');

        return new CryptoKey(keyBytes);
    };

    CryptoService.prototype.hashPassword = function (password, key, callback) {
        this.getKey(function (storedKey) {
            key = key || storedKey;

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = forge.pbkdf2(key.key, forge.util.encodeUtf8(password), 1, 256 / 8, 'sha256');
            callback(forge.util.encode64(hashBits));
        });
    };

    CryptoService.prototype.encrypt = function (plainValue, key, plainValueEncoding) {
        var self = this;
        var deferred = Q.defer();

        if (plainValue === null || plainValue === undefined) {
            deferred.resolve(null);
        }
        else {
            self.getKey(function (localKey) {
                key = key || localKey;
                if (!key) {
                    throw 'Encryption key unavailable.';
                }

                plainValueEncoding = plainValueEncoding || 'utf8';
                var buffer = forge.util.createBuffer(plainValue, plainValueEncoding);
                var ivBytes = forge.random.getBytesSync(16);
                var cipher = forge.cipher.createCipher('AES-CBC', key.encKey);
                cipher.start({ iv: ivBytes });
                cipher.update(buffer);
                cipher.finish();

                var iv = forge.util.encode64(ivBytes);
                var ctBytes = cipher.output.getBytes();
                var ct = forge.util.encode64(ctBytes);
                var mac = !key.macKey ? null : computeMac(ctBytes, ivBytes, key.macKey);

                var cs = new CipherString(key.encType, iv, ct, mac);
                deferred.resolve(cs);
            });
        }

        return deferred.promise;
    };

    CryptoService.prototype.decrypt = function (cipherString, key, outputEncoding) {
        var deferred = Q.defer();
        var self = this;

        if (cipherString === null || cipherString === undefined || !cipherString.encryptedString) {
            throw 'cannot decrypt nothing';
        }

        self.getKey(function (localKey) {
            key = key || localKey;
            if (!key) {
                throw 'Encryption key unavailable.';
            }

            outputEncoding = outputEncoding || 'utf8';

            if (cipherString.encryptionType === constantsService.encType.AesCbc128_HmacSha256_B64 &&
                key.encType === constantsService.encType.AesCbc256_B64) {
                // Old encrypt-then-mac scheme, swap out the key
                _legacyEtmKey = _legacyEtmKey ||
                    new CryptoKey(key.key, false, constantsService.encType.AesCbc128_HmacSha256_B64);
                key = _legacyEtmKey;
            }

            if (cipherString.encryptionType !== key.encType) {
                throw 'encType unavailable.';
            }

            var ivBytes = forge.util.decode64(cipherString.initializationVector);
            var ctBytes = forge.util.decode64(cipherString.cipherText);

            if (key.macKey && cipherString.mac) {
                var computedMac = computeMac(ctBytes, ivBytes, key.macKey);
                if (computedMac !== cipherString.mac) {
                    console.error('MAC failed.');
                    deferred.reject('MAC failed.');
                }
            }

            try {
                var ctBuffer = forge.util.createBuffer(ctBytes);
                var decipher = forge.cipher.createDecipher('AES-CBC', key.encKey);
                decipher.start({ iv: ivBytes });
                decipher.update(ctBuffer);
                decipher.finish();

                var decValue;
                if (outputEncoding === 'utf8') {
                    decValue = decipher.output.toString('utf8');
                }
                else {
                    decValue = decipher.output.getBytes();
                }
                deferred.resolve(decValue);
            }
            catch (e) {
                deferred.reject('Decryption failed.');
            }
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

    function CryptoKey(keyBytes, b64KeyBytes, encType) {
        if (b64KeyBytes) {
            keyBytes = forge.util.decode64(keyBytes);
        }

        if (!keyBytes) {
            throw 'Must provide keyBytes';
        }

        var buffer = forge.util.createBuffer(keyBytes);
        if (!buffer || buffer.length() === 0) {
            throw 'Couldn\'t make buffer';
        }
        var bufferLength = buffer.length();

        if (encType === null || encType === undefined) {
            if (bufferLength === 32) {
                encType = constantsService.encType.AesCbc256_B64;
            }
            else if (bufferLength === 64) {
                encType = constantsService.encType.AesCbc256_HmacSha256_B64;
            }
            else {
                throw 'Unable to determine encType.';
            }
        }

        this.key = keyBytes;
        this.keyB64 = forge.util.encode64(keyBytes);
        this.encType = encType;

        if (encType === constantsService.encType.AesCbc256_B64 && bufferLength === 32) {
            this.encKey = keyBytes;
            this.macKey = null;
        }
        else if (encType === constantsService.encType.AesCbc128_HmacSha256_B64 && bufferLength === 32) {
            this.encKey = buffer.getBytes(16); // first half
            this.macKey = buffer.getBytes(16); // second half
        }
        else if (encType === constantsService.encType.AesCbc256_HmacSha256_B64 && bufferLength === 64) {
            this.encKey = buffer.getBytes(32); // first half
            this.macKey = buffer.getBytes(32); // second half
        }
        else {
            throw 'Unsupported encType/key length.';
        }
    }
};
