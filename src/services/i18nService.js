export default function i18nService(utilsService) {
    this.utilsService = utilsService;
    this.messages = {};

    var self = this;

    if (self.utilsService.isEdge()) {
        var rawFile = new XMLHttpRequest();
        rawFile.open('GET', '../_locales/en/messages.json', false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status === 0) {
                    var locales = JSON.parse(rawFile.responseText);
                    for (var property in locales) {
                        if (locales.hasOwnProperty(property)) {
                            self.messages[property] = chrome.i18n.getMessage(property);
                        }
                    }
                }
            }
        };
        rawFile.send(null);

        return self.messages;
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
