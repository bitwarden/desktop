export default function i18nService() {
    const edgeMessages: any = {};

    if (navigator.userAgent.indexOf(' Edge/') !== -1) {
        fetch('../_locales/en/messages.json')
            .then((file) => {
                return file.json();
            })
            .then((locales) => {
                for (const prop in locales) {
                    if (locales.hasOwnProperty(prop)) {
                        edgeMessages[prop] = chrome.i18n.getMessage(prop);
                    }
                }
            });

        return edgeMessages;
    }

    return new Proxy({}, {
        get(target, name) {
            return chrome.i18n.getMessage(name);
        },
        set(target, name, value) {
            throw new Error('set not allowed for i18n');
            // @ts-ignore: Unreachable code error
            return false;
        },
    });
}
