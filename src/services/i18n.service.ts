import * as path from 'path';

import { I18nService as I18nServiceAbstraction } from 'jslib/abstractions/i18n.service';

// First locale is the default (English)
const SupportedTranslationLocales = [
    'en', 'es',
];

export class I18nService implements I18nServiceAbstraction {
    defaultMessages: any = {};
    localeMessages: any = {};
    locale: string;
    translationLocale: string;
    collator: Intl.Collator;
    inited: boolean;

    constructor(private systemLanguage: string, private localesDirectory: string) {
    }

    async init(locale?: string) {
        if (this.inited) {
            throw new Error('i18n already initialized.');
        }

        this.inited = true;
        this.locale = this.translationLocale = locale != null ? locale : this.systemLanguage;
        this.collator = new Intl.Collator(this.locale);

        if (SupportedTranslationLocales.indexOf(this.translationLocale) === -1) {
            this.translationLocale = this.translationLocale.slice(0, 2);

            if (SupportedTranslationLocales.indexOf(this.translationLocale) === -1) {
                this.translationLocale = SupportedTranslationLocales[0];
            }
        }

        await this.loadMessages(this.translationLocale, this.localeMessages);
        if (this.translationLocale !== SupportedTranslationLocales[0]) {
            await this.loadMessages(SupportedTranslationLocales[0], this.defaultMessages);
        }
    }

    t(id: string): string {
        return this.translate(id);
    }

    translate(id: string): string {
        if (this.localeMessages.hasOwnProperty(id) && this.localeMessages[id]) {
            return this.localeMessages[id];
        } else if (this.defaultMessages.hasOwnProperty(id) && this.defaultMessages[id]) {
            return this.defaultMessages[id];
        }
        return '';
    }

    private loadMessages(locale: string, messagesObj: any): Promise<any> {
        const formattedLocale = locale.replace('-', '_');
        const filePath = path.join(__dirname, this.localesDirectory + '/' + formattedLocale + '/messages.json');
        const locales = (window as any).require(filePath);
        for (const prop in locales) {
            if (locales.hasOwnProperty(prop)) {
                messagesObj[prop] = locales[prop].message;
            }
        }

        return Promise.resolve();
    }
}
