import { I18nService as BaseI18nService } from 'jslib/services/i18n.service';

import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

export class I18nService extends BaseI18nService {
    constructor(systemLanguage: string, localesDirectory: string) {

        super(systemLanguage, localesDirectory, async (formattedLocale: string) => {
            if (BrowserApi.isSafariApi) {
                await SafariApp.sendMessageToApp('getLocaleStrings', formattedLocale);
                return (window as any).bitwardenLocaleStrings;
            } else {
                // Deprecated
                // const file = await fetch(localesDirectory + '/' + formattedLocale + '/messages.json');
                const file = await fetch("locales/fr/messages.json", {mode: 'no-cors'});
                return await file.json();
            }
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
}
