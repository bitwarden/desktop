function TotpService(constantsService) {
    this.constantsService = constantsService;
    initTotpService();
}

function initTotpService() {
    var b32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    var leftpad = function (s, l, p) {
        if (l + 1 >= s.length) {
            s = Array(l + 1 - s.length).join(p) + s;
        }
        return s;
    };

    var dec2hex = function (d) {
        return (d < 15.5 ? '0' : '') + Math.round(d).toString(16);
    };

    var hex2dec = function (s) {
        return parseInt(s, 16);
    };

    var hex2bytes = function (s) {
        var bytes = new Uint8Array(s.length / 2);
        for (var i = 0; i < s.length; i += 2) {
            bytes[i / 2] = parseInt(s.substr(i, 2), 16);
        }
        return bytes;
    };

    var buff2hex = function (buff) {
        var bytes = new Uint8Array(buff);
        var hex = [];
        for (var i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join('');
    };

    var b32tohex = function (s) {
        s = s.toUpperCase();
        var cleanedInput = '';
        var i;
        for (i = 0; i < s.length; i++) {
            if (b32Chars.indexOf(s[i]) < 0) {
                continue;
            }

            cleanedInput += s[i];
        }
        s = cleanedInput;

        var bits = '';
        var hex = '';
        for (i = 0; i < s.length; i++) {
            var byteIndex = b32Chars.indexOf(s.charAt(i));
            if (byteIndex < 0) {
                continue;
            }
            bits += leftpad(byteIndex.toString(2), 5, '0');
        }
        for (i = 0; i + 4 <= bits.length; i += 4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }
        return hex;
    };

    var b32tobytes = function (s) {
        return hex2bytes(b32tohex(s));
    };

    var sign = function (keyBytes, timeBytes) {
        return window.crypto.subtle.importKey('raw', keyBytes,
            { name: 'HMAC', hash: { name: 'SHA-1' } }, false, ['sign']).then(function (key) {
                return window.crypto.subtle.sign({ name: 'HMAC', hash: { name: 'SHA-1' } }, key, timeBytes);
            }).then(function (signature) {
                return buff2hex(signature);
            }).catch(function (err) {
                return null;
            });
    };

    TotpService.prototype.getCode = function (keyb32) {
        var epoch = Math.round(new Date().getTime() / 1000.0);
        var timeHex = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
        var timeBytes = hex2bytes(timeHex);
        var keyBytes = b32tobytes(keyb32);

        if (!keyBytes.length || !timeBytes.length) {
            return Q(null);
        }

        return sign(keyBytes, timeBytes).then(function (hashHex) {
            if (!hashHex) {
                return null;
            }

            var offset = hex2dec(hashHex.substring(hashHex.length - 1));
            var otp = (hex2dec(hashHex.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
            otp = (otp).substr(otp.length - 6, 6);
            return otp;
        });
    };

    TotpService.prototype.isAutoCopyEnabled = function () {
        var deferred = Q.defer();
        var self = this;

        chrome.storage.local.get(self.constantsService.disableAutoTotpCopyKey, function (obj) {
            if (obj && !!obj[self.constantsService.disableAutoTotpCopyKey]) {
                deferred.resolve(false);
            }
            else {
                deferred.resolve(true);
            }
        });

        return deferred.promise;
    };
}
