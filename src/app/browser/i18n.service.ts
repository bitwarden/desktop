import { I18nService as BaseI18nService } from 'jslib/services/i18n.service';

class CozyAppElement extends Element {
    dataset: {
        cozy: string
    };
}

export class I18nService extends BaseI18nService {
    constructor(systemLanguage: string, localesDirectory: string) {

        super(systemLanguage, localesDirectory, async (formattedLocale: string) => {
            const appLocale = this.getCozyLanguage();

            const file = await fetch(`locales/${appLocale}/messages.json`, {mode: 'no-cors'});
            return await file.json();
        });

        this.supportedTranslationLocales = [
            'en', 'be', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'en-GB', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu',
            'id', 'it', 'ja', 'ko', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sv', 'th', 'tr', 'uk', 'vi',
            'zh-CN', 'zh-TW',
        ];
    }

    t(id: string, p1?: string, p2?: string, p3?: string): string {
        return this.translate(id, p1, p2, p3);
    }

    getCozyLanguage() {
        const root = document.querySelector<CozyAppElement>('[role=application]');
        const data = JSON.parse(root?.dataset?.cozy);

        return data.locale ?? 'en';
    }
}
