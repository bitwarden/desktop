function i18nService() {
    return new Proxy({}, {
        get: function (target, name) {
            return chrome.i18n.getMessage(name);
        },
        set: function (target, name, value) {
            throw 'set not allowed for i18n';
        }
    });
};
