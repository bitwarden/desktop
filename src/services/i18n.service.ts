import BrowserUtilsService from '../services/browserUtils.service';

export default function i18nService(browserUtilsService: BrowserUtilsService) {
    const edgeMessages: any = {};

    if (browserUtilsService.isEdge()) {
        fetch('../_locales/en/messages.json').then((file) => {
            return file.json();
        }).then((locales) => {
            for (const prop in locales) {
                if (locales.hasOwnProperty(prop)) {
                    edgeMessages[prop] = chrome.i18n.getMessage(prop);
                }
            }
        });

        return edgeMessages;
    }

    return new Proxy({}, {
        get: (target, name) => {
            return chrome.i18n.getMessage(name);
        },
        set: (target, name, value) => {
            return false;
        },
    });
}
