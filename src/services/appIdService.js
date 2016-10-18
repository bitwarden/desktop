function AppIdService() {
    initAppIdService();
};

function initAppIdService() {
    AppIdService.prototype.getAppId = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        makeAndGetAppId('appId', callback);
    };

    AppIdService.prototype.getAnonymousAppId = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        makeAndGetAppId('anonymousAppId', callback);
    };

    function makeAndGetAppId(key, callback) {
        chrome.storage.local.get(key, function (obj) {
            if (obj && obj[key]) {
                callback(obj[key]);
                return;
            }

            var setObj = {};
            setObj[key] = newGuid();
            chrome.storage.local.set(setObj, function () {
                callback(setObj[key]);
            });
        });
    }

    // ref: http://stackoverflow.com/a/2117523/1090359
    function newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};
