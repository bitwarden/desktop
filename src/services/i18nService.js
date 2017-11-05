export default function i18nService(utilsService) {
    this.__edgeMessages = {};
    const self = this;

    if (utilsService.isEdge()) {
        fetch('../_locales/en/messages.json').then((file) => {
            return file.json();
        }).then((locales) => {
            for (const prop in locales) {
                if (locales.hasOwnProperty(prop)) {
                    self.__edgeMessages[prop] = chrome.i18n.getMessage(prop);
                }
            }
        });

        return this.__edgeMessages;
    }

    return new Proxy({}, {
        get: function (target, name) {
            return chrome.i18n.getMessage(name);
        },
        set: function (target, name, value) {
            throw 'set not allowed for i18n';
        }
    });
}
