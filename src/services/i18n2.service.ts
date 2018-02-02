import { I18nService as I18nServiceAbstraction } from 'jslib/abstractions/i18n.service';

export default class I18n2Service implements I18nServiceAbstraction {
    locale: string;
    translationLocale: string;
    collator: Intl.Collator;
    inited: boolean;

    constructor(private systemLanguage: string, private i18nService: any) {
    }

    async init(locale?: string) {
        if (this.inited) {
            throw new Error('i18n already initialized.');
        }

        this.inited = true;
        this.locale = this.translationLocale = locale != null ? locale : this.systemLanguage;
        this.collator = new Intl.Collator(this.locale);
    }

    t(id: string, p1?: string, p2?: string, p3?: string): string {
        return this.translate(id);
    }

    translate(id: string, p1?: string, p2?: string, p3?: string): string {
        return this.i18nService[id];
    }
}
