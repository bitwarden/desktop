import * as fs from 'fs';
import * as path from 'path';

import { I18nService as BaseI18nService } from 'jslib/services/i18n.service';

export class I18nService extends BaseI18nService {
    constructor(systemLanguage: string, localesDirectory: string) {
        super(systemLanguage, localesDirectory, (formattedLocale: string) => {
            const filePath = path.join(__dirname, this.localesDirectory + '/' + formattedLocale + '/messages.json');
            const localesJson = fs.readFileSync(filePath, 'utf8');
            const locales = JSON.parse(localesJson.replace(/^\uFEFF/, '')); // strip the BOM
            return Promise.resolve(locales);
        });

        this.supportedTranslationLocales = [
            'en', 'af, ''be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en-GB', 'en-IN', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu', 'id',
            'it', 'ja', 'ko', 'lv', 'me', 'ml', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sr', 'sv', 'th', 'tr', 'uk',
            'vi', 'zh-CN', 'zh-TW',
        ];
    }
}
