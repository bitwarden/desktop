import * as fs from 'fs';
import * as path from 'path';

import { I18nService as BaseI18nService } from 'jslib-common/services/i18n.service';

export class I18nService extends BaseI18nService {
    constructor(systemLanguage: string, localesDirectory: string) {
        super(systemLanguage, localesDirectory, (formattedLocale: string) => {
            const filePath = path.join(__dirname, this.localesDirectory + '/' + formattedLocale + '/messages.json');
            const localesJson = fs.readFileSync(filePath, 'utf8');
            const locales = JSON.parse(localesJson.replace(/^\uFEFF/, '')); // strip the BOM
            return Promise.resolve(locales);
        });

        // Please leave 'en' where it is, as it's our fallback language in case no translation can be found
        this.supportedTranslationLocales = [
            'en', 'af', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en-GB', 'en-IN', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu', 'id',
            'it', 'ja', 'kn', 'ko', 'lv', 'me', 'ml', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sr', 'sv', 'th', 'tr', 'uk',
            'vi', 'zh-CN', 'zh-TW',
        ];
    }
}
