import { PlatformUtilsService } from 'jslib/abstractions';

export default function i18nService(platformUtilsService: PlatformUtilsService) {
    const defaultMessages: any = {};
    const localeMessages: any = {};

    // First locale is the default (English)
    const supportedLocales = [
        'en', 'cs', 'da', 'de', 'es', 'et', 'fi', 'fr', 'hr', 'hu', 'id', 'it', 'ja',
        'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk', 'vi',
        'zh-CN', 'zh-TW',
    ];

    async function loadMessages(localesDir: string, locale: string, messagesObj: any,
        messageCallback: (prop: string, message: string) => string): Promise<any> {
        const formattedLocale = locale.replace('-', '_');
        const file = await fetch(localesDir + formattedLocale + '/messages.json');
        const locales = await file.json();
        for (const prop in locales) {
            if (locales.hasOwnProperty(prop)) {
                messagesObj[prop] = messageCallback(prop, locales[prop].message);
            }
        }
    }

    if (platformUtilsService.isEdge()) {
        loadMessages('../_locales/', 'en', localeMessages,
            (prop: string, message: string) => chrome.i18n.getMessage(prop));
        return localeMessages;
    }

    if (platformUtilsService.isSafari()) {
        let lang = navigator.language;
        if (supportedLocales.indexOf(lang) === -1) {
            lang = lang.slice(0, 2);

            if (supportedLocales.indexOf(lang) === -1) {
                lang = supportedLocales[0];
            }
        }

        const dir = './_locales/';
        loadMessages(dir, lang, localeMessages, (prop: string, message: string) => message);
        if (lang !== supportedLocales[0]) {
            loadMessages(dir, supportedLocales[0], defaultMessages, (prop: string, message: string) => message);
        }
    }

    return new Proxy({}, {
        get: (target, name) => {
            const id = name.toString();

            if (platformUtilsService.isSafari()) {
                if (localeMessages.hasOwnProperty(id) && localeMessages[id]) {
                    return localeMessages[id];
                } else if (defaultMessages.hasOwnProperty(id) && defaultMessages[id]) {
                    return defaultMessages[id];
                }
                return '';
            }

            return chrome.i18n.getMessage(id);
        },
        set: (target, name, value) => {
            return false;
        },
    });
}
