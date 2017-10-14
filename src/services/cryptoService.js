function CryptoService(constantsService) {
    this.constantsService = constantsService;
    initCryptoService(constantsService);
}

function initCryptoService(constantsService) {
    var _key,
        _encKey,
        _legacyEtmKey,
        _keyHash,
        _privateKey,
        _orgKeys,
        _crypto = window.crypto,
        _subtle = window.crypto.subtle;

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
    };

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
    };

    CryptoService.prototype.setEncKey = function (encKey) {
        var deferred = Q.defer();

        if (encKey === undefined) {
            deferred.resolve();
            return deferred.promise;
        }

        chrome.storage.local.set({
            'encKey': encKey
        }, function () {
            _encKey = null;
            deferred.resolve();
        });

        return deferred.promise;
    };

    CryptoService.prototype.setEncPrivateKey = function (encPrivateKey) {
        var deferred = Q.defer();

        if (encPrivateKey === undefined) {
            deferred.resolve();
            return deferred.promise;
        }

        chrome.storage.local.set({
            'encPrivateKey': encPrivateKey
        }, function () {
            _privateKey = null;
            deferred.resolve();
        });

        return deferred.promise;
    };

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
    };

    CryptoService.prototype.getKey = function () {
        var deferred = Q.defer();

        if (_key) {
            deferred.resolve(_key);
            return deferred.promise;
        }

        var self = this;
        chrome.storage.local.get(self.constantsService.lockOptionKey, function (obj) {
            if (obj && (obj[self.constantsService.lockOptionKey] || obj[self.constantsService.lockOptionKey] === 0)) {
                // if we have a lock option set, we do not try to fetch the storage key since it should not even be there
                deferred.resolve(null);
                return;
            }

            chrome.storage.local.get('key', function (obj) {
                if (obj && obj.key) {
                    _key = new SymmetricCryptoKey(obj.key, true);
                }

                deferred.resolve(_key);
            });
        });

        return deferred.promise;
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

    CryptoService.prototype.getEncKey = function () {
        var deferred = Q.defer();
        if (_encKey) {
            deferred.resolve(_encKey);
            return deferred.promise;
        }

        var self = this;
        chrome.storage.local.get('encKey', function (obj) {
            if (!obj || !obj.encKey) {
                deferred.resolve(null);
                return;
            }

            self.getKey().then(function (key) {
                return self.decrypt(new CipherString(obj.encKey), key, 'raw');
            }).then(function (encKey) {
                _encKey = new SymmetricCryptoKey(encKey);
                deferred.resolve(_encKey);
            }, function () {
                deferred.reject('Cannot get enc key. Decryption failed.');
            });
        });

        return deferred.promise;
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
                deferred.resolve(null);
                return;
            }

            self.decrypt(new CipherString(obj.encPrivateKey), null, 'raw').then(function (privateKey) {
                var privateKeyB64 = forge.util.encode64(privateKey);
                _privateKey = fromB64ToArray(privateKeyB64).buffer;
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
                        /* jshint ignore:start */
                        (function (orgIdInstance) {
                            var promise = self.rsaDecrypt(obj.encOrgKeys[orgIdInstance]).then(function (decValueB64) {
                                orgKeys[orgIdInstance] = new SymmetricCryptoKey(decValueB64, true);
                                setKey = true;
                            }, function (err) {
                                console.log('getOrgKeys error: ' + err);
                            });
                            decPromises.push(promise);
                        })(orgId);
                        /* jshint ignore:end */
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

    CryptoService.prototype.clearEncKey = function (memoryOnly) {
        var deferred = Q.defer();

        _encKey = null;
        if (memoryOnly) {
            deferred.resolve();
        }
        else {
            chrome.storage.local.remove('encKey', function () {
                deferred.resolve();
            });
        }

        return deferred.promise;
    };

    CryptoService.prototype.clearPrivateKey = function (memoryOnly) {
        var deferred = Q.defer();

        _privateKey = null;
        if (memoryOnly) {
            deferred.resolve();
        }
        else {
            chrome.storage.local.remove('encPrivateKey', function () {
                deferred.resolve();
            });
        }

        return deferred.promise;
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

    CryptoService.prototype.clearKeys = function () {
        var self = this;
        return Q.all([
            self.clearKey(),
            self.clearKeyHash(),
            self.clearOrgKeys(),
            self.clearEncKey(),
            self.clearPrivateKey()
        ]);
    };

    CryptoService.prototype.toggleKey = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.getKey().then(function (key) {
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
        this.getKey().then(function (storedKey) {
            key = key || storedKey;

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = forge.pbkdf2(key.key, forge.util.encodeUtf8(password), 1, 256 / 8, 'sha256');
            callback(forge.util.encode64(hashBits));
        });
    };

    CryptoService.prototype.makeEncKey = function (key) {
        var bytes = new Uint8Array(512 / 8);
        _crypto.getRandomValues(bytes);
        return this.encrypt(bytes, key, 'raw');
    };

    CryptoService.prototype.encrypt = function (plainValue, key, plainValueEncoding) {
        if (plainValue === null || plainValue === undefined) {
            return Q(null);
        }

        plainValueEncoding = plainValueEncoding || 'utf8';
        if (plainValueEncoding === 'utf8') {
            plainValue = fromUtf8ToArray(plainValue);
        }

        return aesEncrypt(this, plainValue.buffer, key).then(function (encValue) {
            var encType = encValue.key.encType;
            var iv = fromBufferToB64(encValue.iv);
            var ct = fromBufferToB64(encValue.ct);
            var mac = encValue.mac ? fromBufferToB64(encValue.mac) : null;
            return new CipherString(encType, iv, ct, mac);
        });
    };

    CryptoService.prototype.encryptToBytes = function (plainValue, key) {
        return aesEncrypt(this, plainValue, key).then(function (encValue) {
            var macLen = 0;
            if (encValue.mac) {
                macLen = encValue.mac.length;
            }

            var encBytes = new Uint8Array(1 + encValue.iv.length + macLen + encValue.ct.length);

            encBytes.set([encValue.key.encType]);
            encBytes.set(encValue.iv, 1);
            if (encValue.mac) {
                encBytes.set(encValue.mac, 1 + encValue.iv.length);
            }
            encBytes.set(encValue.ct, 1 + encValue.iv.length + macLen);

            return encBytes.buffer;
        });
    };

    function aesEncrypt(self, plainValue, key) {
        var obj = {
            iv: new Uint8Array(16),
            ct: null,
            mac: null,
            key: null
        };

        _crypto.getRandomValues(obj.iv);
        var keyBuf;

        return getKeyForEncryption(self, key).then(function (keyToUse) {
            obj.key = keyToUse;
            keyBuf = keyToUse.getBuffers();
            return _subtle.importKey('raw', keyBuf.encKey, { name: 'AES-CBC' }, false, ['encrypt']);
        }).then(function (encKey) {
            return _subtle.encrypt({ name: 'AES-CBC', iv: obj.iv }, encKey, plainValue);
        }).then(function (encValue) {
            obj.ct = new Uint8Array(encValue);
            if (!keyBuf.macKey) {
                return null;
            }

            var data = new Uint8Array(obj.iv.length + obj.ct.length);
            data.set(obj.iv, 0);
            data.set(obj.ct, obj.iv.length);
            return computeMacWC(data.buffer, keyBuf.macKey);
        }).then(function (mac) {
            if (mac) {
                obj.mac = new Uint8Array(mac);
            }
            return obj;
        });
    }

    CryptoService.prototype.decrypt = function (cipherString, key, outputEncoding) {
        outputEncoding = outputEncoding || 'utf8';

        var ivBytes = forge.util.decode64(cipherString.initializationVector);
        var ctBytes = forge.util.decode64(cipherString.cipherText);
        var macBytes = cipherString.mac ? forge.util.decode64(cipherString.mac) : null;

        return aesDecrypt(this, cipherString.encryptionType, ctBytes, ivBytes, macBytes, key).then(function (decipher) {
            if (!decipher) {
                return null;
            }

            if (outputEncoding === 'utf8') {
                return decipher.output.toString('utf8');
            }
            else {
                return decipher.output.getBytes();
            }
        });
    };

    CryptoService.prototype.decryptFromBytes = function (encBuf, key) {
        if (!encBuf) {
            throw 'no encBuf.';
        }

        var encBytes = new Uint8Array(encBuf),
            encType = encBytes[0],
            ctBytes = null,
            ivBytes = null,
            macBytes = null;

        switch (encType) {
            case constantsService.encType.AesCbc128_HmacSha256_B64:
            case constantsService.encType.AesCbc256_HmacSha256_B64:
                if (encBytes.length <= 49) { // 1 + 16 + 32 + ctLength
                    return null;
                }

                ivBytes = encBytes.slice(1, 17);
                macBytes = encBytes.slice(17, 49);
                ctBytes = encBytes.slice(49);
                break;
            case constantsService.encType.AesCbc256_B64:
                if (encBytes.length <= 17) { // 1 + 16 + ctLength
                    return null;
                }

                ivBytes = encBytes.slice(1, 17);
                ctBytes = encBytes.slice(17);
                break;
            default:
                return null;
        }

        return aesDecryptWC(this, encType, ctBytes.buffer, ivBytes.buffer, macBytes ? macBytes.buffer : null, key);
    };

    function aesDecrypt(self, encType, ctBytes, ivBytes, macBytes, key) {
        return getKeyForEncryption(self, key).then(function (theKey) {
            theKey = resolveLegacyKey(encType, theKey);

            if (encType !== theKey.encType) {
                console.error('encType unavailable.');
                return null;
            }

            if (theKey.macKey && macBytes) {
                var computedMacBytes = computeMac(ivBytes + ctBytes, theKey.macKey, false);
                if (!macsEqual(theKey.macKey, computedMacBytes, macBytes)) {
                    console.error('MAC failed.');
                    return null;
                }
            }

            var ctBuffer = forge.util.createBuffer(ctBytes);
            var decipher = forge.cipher.createDecipher('AES-CBC', theKey.encKey);
            decipher.start({ iv: ivBytes });
            decipher.update(ctBuffer);
            decipher.finish();

            return decipher;
        });
    }

    function aesDecryptWC(self, encType, ctBuf, ivBuf, macBuf, key) {
        var keyBuf,
            encKey;

        return getKeyForEncryption(self, key).then(function (theKey) {
            theKey = resolveLegacyKey(encType, theKey);
            keyBuf = theKey.getBuffers();
            return _subtle.importKey('raw', keyBuf.encKey, { name: 'AES-CBC' }, false, ['decrypt']);
        }).then(function (theEncKey) {
            encKey = theEncKey;

            if (!keyBuf.macKey || !macBuf) {
                return null;
            }

            var data = new Uint8Array(ivBuf.byteLength + ctBuf.byteLength);
            data.set(new Uint8Array(ivBuf), 0);
            data.set(new Uint8Array(ctBuf), ivBuf.byteLength);
            return computeMacWC(data.buffer, keyBuf.macKey);
        }).then(function (computedMacBuf) {
            if (computedMacBuf === null) {
                return null;
            }
            return macsEqualWC(keyBuf.macKey, macBuf, computedMacBuf);
        }).then(function (macsMatch) {
            if (macsMatch === false) {
                console.error('MAC failed.');
                return null;
            }
            return _subtle.decrypt({ name: 'AES-CBC', iv: ivBuf }, encKey, ctBuf);
        });
    }

    function resolveLegacyKey(encType, key) {
        if (encType === constantsService.encType.AesCbc128_HmacSha256_B64 &&
            key.encType === constantsService.encType.AesCbc256_B64) {
            // Old encrypt-then-mac scheme, make a new key
            _legacyEtmKey = _legacyEtmKey ||
                new SymmetricCryptoKey(key.key, false, constantsService.encType.AesCbc128_HmacSha256_B64);
            return _legacyEtmKey;
        }

        return key;
    }

    CryptoService.prototype.rsaDecrypt = function (encValue) {
        var headerPieces = encValue.split('.'),
            encType,
            encPieces;

        if (headerPieces.length === 1) {
            encType = constantsService.encType.Rsa2048_OaepSha256_B64;
            encPieces = [headerPieces[0]];
        }
        else if (headerPieces.length === 2) {
            try {
                encType = parseInt(headerPieces[0]);
                encPieces = headerPieces[1].split('|');
            }
            catch (e) { }
        }

        switch (encType) {
            case constantsService.encType.Rsa2048_OaepSha256_B64:
            case constantsService.encType.Rsa2048_OaepSha1_B64:
                if (encPieces.length !== 1) {
                    throw 'Invalid cipher format.';
                }
                break;
            case constantsService.encType.Rsa2048_OaepSha256_HmacSha256_B64:
            case constantsService.encType.Rsa2048_OaepSha1_HmacSha256_B64:
                if (encPieces.length !== 2) {
                    throw 'Invalid cipher format.';
                }
                break;
            default:
                throw 'encType unavailable.';
        }

        var padding = null;
        switch (encType) {
            case constantsService.encType.Rsa2048_OaepSha256_B64:
            case constantsService.encType.Rsa2048_OaepSha256_HmacSha256_B64:
                padding = {
                    name: 'RSA-OAEP',
                    hash: { name: 'SHA-256' }
                };
                break;
            case constantsService.encType.Rsa2048_OaepSha1_B64:
            case constantsService.encType.Rsa2048_OaepSha1_HmacSha256_B64:
                padding = {
                    name: 'RSA-OAEP',
                    hash: { name: 'SHA-1' }
                };
                break;
            default:
                throw 'encType unavailable.';
        }

        var key = null,
            self = this;

        return self.getEncKey().then(function (encKey) {
            key = encKey;
            return self.getPrivateKey();
        }).then(function (privateKeyBytes) {
            if (!privateKeyBytes) {
                throw 'No private key.';
            }

            if (!padding) {
                throw 'Cannot determine padding.';
            }

            return _subtle.importKey('pkcs8', privateKeyBytes, padding, false, ['decrypt']);
        }).then(function (privateKey) {
            if (!encPieces || !encPieces.length) {
                throw 'encPieces unavailable.';
            }

            if (key && key.macKey && encPieces.length > 1) {
                var ctBytes = forge.util.decode64(encPieces[0]);
                var macBytes = forge.util.decode64(encPieces[1]);
                var computedMacBytes = computeMac(ctBytes, key.macKey, false);
                if (!macsEqual(key.macKey, macBytes, computedMacBytes)) {
                    throw 'MAC failed.';
                }
            }

            var ctArr = fromB64ToArray(encPieces[0]);
            return _subtle.decrypt(padding, privateKey, ctArr.buffer);
        }, function () {
            throw 'Cannot import privateKey.';
        }).then(function (decBytes) {
            var b64DecValue = fromBufferToB64(decBytes);
            return b64DecValue;
        }, function () {
            throw 'Cannot rsa decrypt.';
        });
    };

    function computeMac(dataBytes, macKey, b64Output) {
        var hmac = forge.hmac.create();
        hmac.start('sha256', macKey);
        hmac.update(dataBytes);
        var mac = hmac.digest();
        return b64Output ? forge.util.encode64(mac.getBytes()) : mac.getBytes();
    }

    function computeMacWC(dataBuf, macKeyBuf) {
        return _subtle.importKey('raw', macKeyBuf, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
            .then(function (key) {
                return _subtle.sign({ name: 'HMAC', hash: { name: 'SHA-256' } }, key, dataBuf);
            });
    }

    function getKeyForEncryption(self, key) {
        var deferred = Q.defer();

        if (key) {
            deferred.resolve(key);
        }
        else {
            self.getEncKey().then(function (encKey) {
                return encKey || self.getKey();
            }).then(function (keyToUse) {
                deferred.resolve(keyToUse);
            });
        }

        return deferred.promise;
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

    function macsEqualWC(macKeyBuf, mac1Buf, mac2Buf) {
        var mac1,
            macKey;

        return window.crypto.subtle.importKey('raw', macKeyBuf, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
            .then(function (key) {
                macKey = key;
                return window.crypto.subtle.sign({ name: 'HMAC', hash: { name: 'SHA-256' } }, macKey, mac1Buf);
            }).then(function (mac) {
                mac1 = mac;
                return window.crypto.subtle.sign({ name: 'HMAC', hash: { name: 'SHA-256' } }, macKey, mac2Buf);
            }).then(function (mac2) {
                if (mac1.byteLength !== mac2.byteLength) {
                    return false;
                }

                var arr1 = new Uint8Array(mac1);
                var arr2 = new Uint8Array(mac2);

                for (var i = 0; i < arr2.length; i++) {
                    if (arr1[i] !== arr2[i]) {
                        return false;
                    }
                }

                return true;
            });
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

    SymmetricCryptoKey.prototype.getBuffers = function () {
        if (this.keyBuf) {
            return this.keyBuf;
        }

        var key = fromB64ToArray(this.keyB64);

        var keys = {
            key: key.buffer
        };

        if (this.macKey) {
            keys.encKey = key.slice(0, key.length / 2).buffer;
            keys.macKey = key.slice(key.length / 2).buffer;
        }
        else {
            keys.encKey = key.buffer;
            keys.macKey = null;
        }

        this.keyBuf = keys;
        return this.keyBuf;
    };

    function fromBufferToB64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function fromBufferToUtf8(buffer) {
        var bytes = new Uint8Array(buffer);
        var encodedString = String.fromCharCode.apply(null, bytes);
        return decodeURIComponent(escape(encodedString));
    }

    function fromB64ToArray(str) {
        var binary_string = window.atob(str);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    function fromUtf8ToArray(str) {
        var strUtf8 = unescape(encodeURIComponent(str));
        var arr = new Uint8Array(strUtf8.length);
        for (var i = 0; i < strUtf8.length; i++) {
            arr[i] = strUtf8.charCodeAt(i);
        }
        return arr;
    }
}
