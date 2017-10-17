function AppIdService(utilsService) {
    this.utilsService = utilsService;

    initAppIdService();
}

function initAppIdService() {
    AppIdService.prototype.getAppId = function () {
        return makeAndGetAppId('appId', this);
    };

    AppIdService.prototype.getAnonymousAppId = function () {
        return makeAndGetAppId('anonymousAppId', this);
    };

    function makeAndGetAppId(key, self) {
        return self.utilsService.getObjFromStorage(key).then(function (obj) {
            if (obj) {
                return obj;
            }

            var guid = newGuid();
            return self.utilsService.saveObjToStorage(key, guid).then(function () {
                return guid;
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
}
