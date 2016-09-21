function UtilsService() {
    initUtilsService();

    this.browserCache = null;
};

function initUtilsService() {
    UtilsService.prototype.getBrowser = function () {
        if (this.browserCache) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf("Firefox") !== -1 || navigator.userAgent.indexOf("Gecko/") !== -1) {
            this.browserCache = 'firefox';
        }
        else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = 'opera';
        }
        else if (navigator.userAgent.indexOf(" Edge/") !== -1) {
            this.browserCache = 'edge';
        }
        else if (window.chrome) {
            this.browserCache = 'chrome';
        }

        return this.browserCache;
    };

    UtilsService.prototype.isFirefox = function () {
        return this.getBrowser() === 'firefox';
    }

    UtilsService.prototype.isChrome = function () {
        return this.getBrowser() === 'chrome';
    }

    UtilsService.prototype.isEdge = function () {
        return this.getBrowser() === 'edge';
    }

    UtilsService.prototype.isOpera = function () {
        return this.getBrowser() === 'opera';
    }
};
