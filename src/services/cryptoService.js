function CryptoService(constantsService) {
    this.constantsService = constantsService;
    initCryptoService(constantsService);
};

function initCryptoService(constantsService) {
    var _key,
        _legacyEtmKey,
        _keyHash,
        _privateKey,
        _orgKeys;

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

    CryptoService.prototype.setEncPrivateKey = function (encPrivateKey) {
        var deferred = Q.defer();

        chrome.storage.local.set({
            'encPrivateKey': encPrivateKey
        }, function () {
            deferred.resolve();
        });

        return deferred.promise;
    }

    CryptoService.prototype.setOrgKeys = function (orgs) {
        var deferred = Q.defer();

        var orgKeys = {};
        for (var i = 0; i < orgs.length; i++) {
            orgKeys[orgs[i].id] = orgs[i].key;
        }

        chrome.storage.local.set({
            'encOrgKeys': orgKeys
        }, function () {
            deferred.resolve();
        });

        return deferred.promise;
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
                    _key = new SymmetricCryptoKey(obj.key, true);
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

    CryptoService.prototype.getPrivateKey = function () {
        var deferred = Q.defer();
        if (_privateKey) {
            deferred.resolve(_privateKey);
            return deferred.promise;
        }

        var self = this;
        chrome.storage.local.get('encPrivateKey', function (obj) {
            if (!obj || !obj.encPrivateKey) {
                deferred.reject('Cannot get enc private key.');
                return;
            }

            self.decrypt(new CipherString(obj.encPrivateKey), null, 'raw').then(function (privateKey) {
                var privateKeyB64 = forge.util.encode64(privateKey);
                _privateKey = fromB64ToBuffer(privateKeyB64);
                deferred.resolve(_privateKey);
            }, function () {
                deferred.reject('Cannot get private key. Decryption failed.');
            });
        });

        return deferred.promise;
    };

    CryptoService.prototype.getOrgKeys = function () {
        var deferred = Q.defer();

        if (_orgKeys && _orgKeys.length) {
            deferred.resolve(_orgKeys);
            return deferred.promise;
        }

        var self = this;
        chrome.storage.local.get('encOrgKeys', function (obj) {
            if (obj && obj.encOrgKeys) {
                var orgKeys = {},
                    setKey = false;

                var decPromises = [];
                for (var orgId in obj.encOrgKeys) {
                    if (obj.encOrgKeys.hasOwnProperty(orgId)) {
                        (function (orgIdInstance) {
                            var promise = self.rsaDecrypt(obj.encOrgKeys[orgIdInstance]).then(function (decValueB64) {
                                orgKeys[orgIdInstance] = new SymmetricCryptoKey(decValueB64, true);
                                setKey = true;
                            }, function (err) {
                                console.log('getOrgKeys error: ' + err);
                            });
                            decPromises.push(promise);
                        })(orgId);
                    }
                }

                Q.all(decPromises).then(function () {
                    if (setKey) {
                        _orgKeys = orgKeys;
                    }

                    deferred.resolve(_orgKeys);
                });
            }
            else {
                deferred.resolve(null);
            }
        });

        return deferred.promise;
    };

    CryptoService.prototype.getOrgKey = function (orgId) {
        if (!orgId) {
            var deferred = Q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return this.getOrgKeys().then(function (orgKeys) {
            if (!orgKeys || !(orgId in orgKeys)) {
                return null;
            }

            return orgKeys[orgId];
        });
    };

    CryptoService.prototype.clearKey = function (callback) {
        var deferred = Q.defer();

        _key = _legacyEtmKey = null;
        chrome.storage.local.remove('key', function () {
            deferred.resolve();
        });

        return deferred.promise;
    };

    CryptoService.prototype.clearKeyHash = function (callback) {
        var deferred = Q.defer();

        _keyHash = null;
        chrome.storage.local.remove('keyHash', function () {
            deferred.resolve();
        });

        return deferred.promise;
    };

    CryptoService.prototype.clearPrivateKey = function () {
        _privateKey = null;
    };

    CryptoService.prototype.clearOrgKeys = function (memoryOnly) {
        var deferred = Q.defer();

        _orgKeys = null;
        if (memoryOnly) {
            deferred.resolve();
        }
        else {
            chrome.storage.local.remove('encOrgKeys', function () {
                deferred.resolve();
            });
        }

        return deferred.promise;
    };

    CryptoService.prototype.clearKeys = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        Q.all([self.clearKey(), self.clearKeyHash(), self.clearOrgKeys()]).then(function () {
            self.clearPrivateKey();
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
                    self.clearKey().then(function () {
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

        return new SymmetricCryptoKey(keyBytes);
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
                    deferred.reject('Encryption key unavailable.');
                    return;
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
                var mac = !key.macKey ? null : computeMac(ctBytes, ivBytes, key.macKey, true);

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
            deferred.reject('cannot decrypt nothing');
            return;
        }

        self.getKey(function (localKey) {
            key = key || localKey;
            if (!key) {
                deferred.reject('Encryption key unavailable.');
                return;
            }

            outputEncoding = outputEncoding || 'utf8';

            if (cipherString.encryptionType === constantsService.encType.AesCbc128_HmacSha256_B64 &&
                key.encType === constantsService.encType.AesCbc256_B64) {
                // Old encrypt-then-mac scheme, swap out the key
                _legacyEtmKey = _legacyEtmKey ||
                    new SymmetricCryptoKey(key.key, false, constantsService.encType.AesCbc128_HmacSha256_B64);
                key = _legacyEtmKey;
            }

            if (cipherString.encryptionType !== key.encType) {
                deferred.reject('encType unavailable.');
                return;
            }

            var ivBytes = forge.util.decode64(cipherString.initializationVector);
            var ctBytes = forge.util.decode64(cipherString.cipherText);

            if (key.macKey && cipherString.mac) {
                var macBytes = forge.util.decode64(cipherString.mac);
                var computedMacBytes = computeMac(ctBytes, ivBytes, key.macKey, false);
                if (!macsEqual(key.macKey, computedMacBytes, macBytes)) {
                    console.error('MAC failed.');
                    deferred.reject('MAC failed.');
                }
            }

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
        });

        return deferred.promise;
    };

    CryptoService.prototype.rsaDecrypt = function (encValue) {
        var headerPieces = encValue.split('.'),
            encType,
            encPiece;

        if (headerPieces.length === 1) {
            encType = constantsService.encType.Rsa2048_OaepSha256_B64;
            encPiece = headerPieces[0];
        }
        else if (headerPieces.length === 2) {
            try {
                encType = parseInt(headerPieces[0]);
                encPiece = headerPieces[1];
            }
            catch (e) { }
        }

        var padding = null;
        if (encType === constantsService.encType.Rsa2048_OaepSha256_B64) {
            padding = {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }
            }
        }
        else if (encType === constantsService.encType.Rsa2048_OaepSha1_B64) {
            padding = {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-1' }
            }
        }
        else {
            throw 'encType unavailable.';
        }

        return this.getPrivateKey().then(function (privateKeyBytes) {
            if (!privateKeyBytes) {
                throw 'No private key.';
            }

            if (!padding) {
                throw 'Cannot determine padding.';
            }

            return window.crypto.subtle.importKey('pkcs8', privateKeyBytes, padding, false, ['decrypt']);
        }).then(function (privateKey) {
            if (!encPiece) {
                throw 'encPiece unavailable.';
            }

            var ctBytes = fromB64ToBuffer(encPiece);
            return window.crypto.subtle.decrypt({ name: padding.name }, privateKey, ctBytes);
        }, function () {
            throw 'Cannot import privateKey.';
        }).then(function (decBytes) {
            var b64DecValue = toB64FromBuffer(decBytes);
            return b64DecValue;
        }, function () {
            throw 'Cannot rsa decrypt.';
        });
    };

    function computeMac(ct, iv, macKey, b64Output) {
        var hmac = forge.hmac.create();
        hmac.start('sha256', macKey);
        hmac.update(iv + ct);
        var mac = hmac.digest();
        return b64Output ? forge.util.encode64(mac.getBytes()) : mac.getBytes();
    }

    // Safely compare two MACs in a way that protects against timing attacks (Double HMAC Verification).
    // ref: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/
    function macsEqual(macKey, mac1, mac2) {
        var hmac = forge.hmac.create();

        hmac.start('sha256', macKey);
        hmac.update(mac1);
        mac1 = hmac.digest().getBytes();

        hmac.start(null, null);
        hmac.update(mac2);
        mac2 = hmac.digest().getBytes();

        return mac1 === mac2;
    }

    function SymmetricCryptoKey(keyBytes, b64KeyBytes, encType) {
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

    function fromB64ToBuffer(str) {
        var binary_string = window.atob(str);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function toB64FromBuffer(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
};
