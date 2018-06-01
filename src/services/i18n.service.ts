import { I18nService as BaseI18nService } from 'jslib/services/i18n.service';

export default class I18nService extends BaseI18nService {
    constructor(systemLanguage: string, localesDirectory: string) {
        super(systemLanguage, localesDirectory, async (formattedLocale: string) => {
            const file = await fetch(localesDirectory + formattedLocale + '/messages.json');
            return await file.json();
        });

        this.supportedTranslationLocales = [
            'en', 'cs', 'da', 'de', 'es', 'et', 'fa', 'fi', 'fr', 'hr', 'hu', 'id', 'it', 'ja',
            'ko', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk', 'vi',
            'zh-CN', 'zh-TW',
        ];
    }

    t(id: string, p1?: string, p2?: string, p3?: string): string {
        return this.translate(id, p1, p2, p3);
    }

    translate(id: string, p1?: string, p2?: string, p3?: string): string {
        if (this.localesDirectory == null) {
            const placeholders: string[] = [];
            if (p1 != null) {
                placeholders.push(p1);
            }
            if (p2 != null) {
                placeholders.push(p2);
            }
            if (p3 != null) {
                placeholders.push(p3);
            }

            if (placeholders.length) {
                return chrome.i18n.getMessage(id, placeholders);
            } else {
                return chrome.i18n.getMessage(id);
            }
        }

        return super.translate(id, p1, p2, p3);
    }
}
