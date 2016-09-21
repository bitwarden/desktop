function UtilsService() {
    initUtilsService();
};

function initUtilsService() {
    UtilsService.prototype.getBrowser = function () {
        if (navigator.userAgent.indexOf("Firefox") !== -1 || navigator.userAgent.indexOf("Gecko/") !== -1) {
            return 'firefox';
        }
        if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
            return 'opera';
        }
        if (navigator.userAgent.indexOf(" Edge/") !== -1) {
            return 'edge';
        }
        if (window.chrome) {
            return 'chrome';
        }

        return null;
    };
};
