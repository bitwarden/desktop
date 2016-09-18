function PasswordGenerationService() {
    this.optionsCache = null;

    initPasswordGenerationService();
};

function initPasswordGenerationService() {
    var optionsKey = 'passwordGenerationOptions';
    var defaultOptions = {
        length: 10,
        ambiguous: false,
        number: true,
        minNumber: 1,
        uppercase: true,
        minUppercase: 1,
        lowercase: true,
        minLowercase: 1,
        special: false,
        minSpecial: 1
    };

    PasswordGenerationService.prototype.generatePassword = function (options) {
        // overload defaults with given options
        var o = extend({}, defaultOptions, options);

        // sanitize
        if (o.uppercase && o.minUppercase < 0) o.minUppercase = 1;
        if (o.lowercase && o.minLowercase < 0) o.minLowercase = 1;
        if (o.number && o.minNumber < 0) o.minNumber = 1;
        if (o.special && o.minSpecial < 0) o.minSpecial = 1;

        if (!o.length || o.length < 1) o.length = 10;
        var minLength = o.minUppercase + o.minLowercase + o.minNumber + o.minSpecial;
        if (o.length < minLength) o.length = minLength;

        var positions = [];
        if (o.lowercase && o.minLowercase > 0) {
            for (var i = 0; i < o.minLowercase; i++) {
                positions.push('l');
            }
        }
        if (o.uppercase && o.minUppercase > 0) {
            for (var j = 0; j < o.minUppercase; j++) {
                positions.push('u');
            }
        }
        if (o.number && o.minNumber > 0) {
            for (var k = 0; k < o.minNumber; k++) {
                positions.push('n');
            }
        }
        if (o.special && o.minSpecial > 0) {
            for (var l = 0; l < o.minSpecial; l++) {
                positions.push('s');
            }
        }
        while (positions.length < o.length) {
            positions.push('a');
        }

        // shuffle
        positions.sort(function () {
            return randomInt(0, 1) * 2 - 1;
        });

        // build out the char sets
        var allCharSet = '';

        var lowercaseCharSet = 'abcdefghijkmnopqrstuvwxyz';
        if (o.ambiguous) lowercaseCharSet += 'l';
        if (o.lowercase) allCharSet += lowercaseCharSet;

        var uppercaseCharSet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
        if (o.ambiguous) uppercaseCharSet += 'O';
        if (o.uppercase) allCharSet += uppercaseCharSet;

        var numberCharSet = '23456789';
        if (o.ambiguous) numberCharSet += '01';
        if (o.number) allCharSet += numberCharSet;

        var specialCharSet = '!@#$%^&*';
        if (o.special) allCharSet += specialCharSet;

        var password = '';
        for (var m = 0; m < o.length; m++) {
            var positionChars;
            switch (positions[m]) {
                case 'l': positionChars = lowercaseCharSet; break;
                case 'u': positionChars = uppercaseCharSet; break;
                case 'n': positionChars = numberCharSet; break;
                case 's': positionChars = specialCharSet; break;
                case 'a': positionChars = allCharSet; break;
            }

            var randomCharIndex = randomInt(0, positionChars.length - 1);
            password += positionChars.charAt(randomCharIndex);
        }

        return password;
    };

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function extend() {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }

        return arguments[0];
    }

    PasswordGenerationService.prototype.getOptions = function () {
        var deferred = Q.defer();
        var self = this;

        if (self.optionsCache) {
            deferred.resolve(self.optionsCache);
            return deferred.promise;
        }

        chrome.storage.local.get(optionsKey, function (obj) {
            var options = obj[optionsKey];
            if (!options) {
                options = defaultOptions;
            }

            self.optionsCache = options;
            deferred.resolve(self.optionsCache);
        });

        return deferred.promise;
    };

    PasswordGenerationService.prototype.saveOptions = function (options) {
        var deferred = Q.defer();
        var self = this;

        var obj = {};
        obj[optionsKey] = options;
        chrome.storage.local.set(obj, function () {
            self.optionsCache = options;
            deferred.resolve();
        });

        return deferred.promise;
    };
};
