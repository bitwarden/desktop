import { CipherType } from '../enums/cipherType.enum';

import AutofillField from '../models/domain/autofillField';
import AutofillPageDetails from '../models/domain/autofillPageDetails';
import AutofillScript from '../models/domain/autofillScript';

import CipherService from './cipher.service';
import TokenService from './token.service';
import TotpService from './totp.service';
import UtilsService from './utils.service';

const CardAttributes: string[] = ['autoCompleteType', 'data-stripe', 'htmlName', 'htmlID', 'label-tag',
    'placeholder'];

const IdentityAttributes: string[] = ['autoCompleteType', 'data-stripe', 'htmlName', 'htmlID', 'label-tag',
    'placeholder'];

const UsernameFieldNames: string[] = ['username', 'user name', 'email', 'email address', 'e-mail', 'e-mail address',
    'userid', 'user id'];

/* tslint:disable */
const IsoCountries: { [id: string]: string; } = {
    afghanistan: "AF", "aland islands": "AX", albania: "AL", algeria: "DZ", "american samoa": "AS", andorra: "AD",
    angola: "AO", anguilla: "AI", antarctica: "AQ", "antigua and barbuda": "AG", argentina: "AR", armenia: "AM",
    aruba: "AW", australia: "AU", austria: "AT", azerbaijan: "AZ", bahamas: "BS", bahrain: "BH", bangladesh: "BD",
    barbados: "BB", belarus: "BY", belgium: "BE", belize: "BZ", benin: "BJ", bermuda: "BM", bhutan: "BT", bolivia: "BO",
    "bosnia and herzegovina": "BA", botswana: "BW", "bouvet island": "BV", brazil: "BR",
    "british indian ocean territory": "IO", "brunei darussalam": "BN", bulgaria: "BG", "burkina faso": "BF", burundi: "BI",
    cambodia: "KH", cameroon: "CM", canada: "CA", "cape verde": "CV", "cayman islands": "KY",
    "central african republic": "CF", chad: "TD", chile: "CL", china: "CN", "christmas island": "CX",
    "cocos (keeling) islands": "CC", colombia: "CO", comoros: "KM", congo: "CG", "congo, democratic republic": "CD",
    "cook islands": "CK", "costa rica": "CR", "cote d'ivoire": "CI", croatia: "HR", cuba: "CU", cyprus: "CY",
    "czech republic": "CZ", denmark: "DK", djibouti: "DJ", dominica: "DM", "dominican republic": "DO", ecuador: "EC",
    egypt: "EG", "el salvador": "SV", "equatorial guinea": "GQ", eritrea: "ER", estonia: "EE", ethiopia: "ET",
    "falkland islands": "FK", "faroe islands": "FO", fiji: "FJ", finland: "FI", france: "FR", "french guiana": "GF",
    "french polynesia": "PF", "french southern territories": "TF", gabon: "GA", gambia: "GM", georgia: "GE", germany: "DE",
    ghana: "GH", gibraltar: "GI", greece: "GR", greenland: "GL", grenada: "GD", guadeloupe: "GP", guam: "GU",
    guatemala: "GT", guernsey: "GG", guinea: "GN", "guinea-bissau": "GW", guyana: "GY", haiti: "HT",
    "heard island & mcdonald islands": "HM", "holy see (vatican city state)": "VA", honduras: "HN", "hong kong": "HK",
    hungary: "HU", iceland: "IS", india: "IN", indonesia: "ID", "iran, islamic republic of": "IR", iraq: "IQ",
    ireland: "IE", "isle of man": "IM", israel: "IL", italy: "IT", jamaica: "JM", japan: "JP", jersey: "JE",
    jordan: "JO", kazakhstan: "KZ", kenya: "KE", kiribati: "KI", "republic of korea": "KR", "south korea": "KR",
    "democratic people's republic of korea": "KP", "north korea": "KP", kuwait: "KW", kyrgyzstan: "KG",
    "lao people's democratic republic": "LA", latvia: "LV", lebanon: "LB", lesotho: "LS", liberia: "LR",
    "libyan arab jamahiriya": "LY", liechtenstein: "LI", lithuania: "LT", luxembourg: "LU", macao: "MO", macedonia: "MK",
    madagascar: "MG", malawi: "MW", malaysia: "MY", maldives: "MV", mali: "ML", malta: "MT", "marshall islands": "MH",
    martinique: "MQ", mauritania: "MR", mauritius: "MU", mayotte: "YT", mexico: "MX",
    "micronesia, federated states of": "FM", moldova: "MD", monaco: "MC", mongolia: "MN", montenegro: "ME", montserrat: "MS",
    morocco: "MA", mozambique: "MZ", myanmar: "MM", namibia: "NA", nauru: "NR", nepal: "NP", netherlands: "NL",
    "netherlands antilles": "AN", "new caledonia": "NC", "new zealand": "NZ", nicaragua: "NI", niger: "NE", nigeria: "NG",
    niue: "NU", "norfolk island": "NF", "northern mariana islands": "MP", norway: "NO", oman: "OM", pakistan: "PK",
    palau: "PW", "palestinian territory, occupied": "PS", panama: "PA", "papua new guinea": "PG", paraguay: "PY", peru: "PE",
    philippines: "PH", pitcairn: "PN", poland: "PL", portugal: "PT", "puerto rico": "PR", qatar: "QA", reunion: "RE",
    romania: "RO", "russian federation": "RU", rwanda: "RW", "saint barthelemy": "BL", "saint helena": "SH",
    "saint kitts and nevis": "KN", "saint lucia": "LC", "saint martin": "MF", "saint pierre and miquelon": "PM",
    "saint vincent and grenadines": "VC", samoa: "WS", "san marino": "SM", "sao tome and principe": "ST",
    "saudi arabia": "SA", senegal: "SN", serbia: "RS", seychelles: "SC", "sierra leone": "SL", singapore: "SG",
    slovakia: "SK", slovenia: "SI", "solomon islands": "SB", somalia: "SO", "south africa": "ZA",
    "south georgia and sandwich isl.": "GS", spain: "ES", "sri lanka": "LK", sudan: "SD", suriname: "SR",
    "svalbard and jan mayen": "SJ", swaziland: "SZ", sweden: "SE", switzerland: "CH", "syrian arab republic": "SY",
    taiwan: "TW", tajikistan: "TJ", tanzania: "TZ", thailand: "TH", "timor-leste": "TL", togo: "TG", tokelau: "TK",
    tonga: "TO", "trinidad and tobago": "TT", tunisia: "TN", turkey: "TR", turkmenistan: "TM",
    "turks and caicos islands": "TC", tuvalu: "TV", uganda: "UG", ukraine: "UA", "united arab emirates": "AE",
    "united kingdom": "GB", "united states": "US", "united states outlying islands": "UM", uruguay: "UY",
    uzbekistan: "UZ", vanuatu: "VU", venezuela: "VE", vietnam: "VN", "virgin islands, british": "VG",
    "virgin islands, u.s.": "VI", "wallis and futuna": "WF", "western sahara": "EH", yemen: "YE", zambia: "ZM",
    zimbabwe: "ZW",
};

const IsoStates: { [id: string]: string; } = {
    alabama: 'AL', alaska: 'AK', 'american samoa': 'AS', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
    connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', 'federated states of micronesia': 'FM', florida: 'FL',
    georgia: 'GA', guam: 'GU', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
    kentucky: 'KY', louisiana: 'LA', maine: 'ME', 'marshall islands': 'MH', maryland: 'MD', massachusetts: 'MA',
    michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
    'north dakota': 'ND', 'northern mariana islands': 'MP', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', palau: 'PW',
    pennsylvania: 'PA', 'puerto rico': 'PR', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
    tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', 'virgin islands': 'VI', virginia: 'VA', washington: 'WA',
    'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};

var IsoProvinces: { [id: string]: string; } = {
    alberta: 'AB', 'british columbia': 'BC', manitoba: 'MB', 'new brunswick': 'NB', 'newfoundland and labrador': 'NL',
    'nova scotia': 'NS', ontario: 'ON', 'prince edward island': 'PE', quebec: 'QC', saskatchewan: 'SK',
};
/* tslint:enable */

export default class AutofillService {
    constructor(public cipherService: CipherService, public tokenService: TokenService,
        public totpService: TotpService, public utilsService: UtilsService) {
    }

    getFormsWithPasswordFields(pageDetails: AutofillPageDetails): any[] {
        const formData: any[] = [];

        const passwordFields = this.loadPasswordFields(pageDetails, true);
        if (passwordFields.length === 0) {
            return formData;
        }

        for (const formKey in pageDetails.forms) {
            if (!pageDetails.forms.hasOwnProperty(formKey)) {
                continue;
            }

            for (const pf of passwordFields) {
                if (formKey !== pf.form) {
                    continue;
                }

                let uf = this.findUsernameField(pageDetails, pf, false, false);
                if (uf == null) {
                    // not able to find any viewable username fields. maybe there are some "hidden" ones?
                    uf = this.findUsernameField(pageDetails, pf, true, false);
                }

                formData.push({
                    form: pageDetails.forms[formKey],
                    password: pf,
                    username: uf,
                });
                break;
            }
        }

        return formData;
    }

    async doAutoFill(options: any) {
        let totpPromise: Promise<string> = null;
        const tab = await this.getActiveTab();
        if (!tab || !options.cipher || !options.pageDetails || !options.pageDetails.length) {
            throw new Error('Nothing to auto-fill.');
        }

        let didAutofill = false;
        for (const pd of options.pageDetails) {
            // make sure we're still on correct tab
            if (pd.tab.id !== tab.id || pd.tab.url !== tab.url) {
                continue;
            }

            const fillScript = this.generateFillScript(pd.details, {
                skipUsernameOnlyFill: options.skipUsernameOnlyFill || false,
                cipher: options.cipher,
            });

            if (!fillScript || !fillScript.script || !fillScript.script.length) {
                continue;
            }

            didAutofill = true;
            if (!options.skipLastUsed) {
                this.cipherService.updateLastUsedDate(options.cipher.id);
            }

            chrome.tabs.sendMessage(tab.id, {
                command: 'fillForm',
                // tslint:disable-next-line
                fillScript: fillScript,
            }, { frameId: pd.frameId });

            if (options.cipher.type !== CipherType.Login || totpPromise ||
                (options.fromBackground && this.utilsService.isFirefox()) || options.skipTotp ||
                !options.cipher.login.totp || !this.tokenService.getPremium()) {
                continue;
            }

            totpPromise = this.totpService.isAutoCopyEnabled().then((enabled) => {
                if (enabled) {
                    return this.totpService.getCode(options.cipher.login.totp);
                }

                return null;
            }).then((code: string) => {
                if (code) {
                    UtilsService.copyToClipboard(code);
                }

                return code;
            });
        }

        if (didAutofill) {
            if (totpPromise != null) {
                const totpCode = await totpPromise;
                return totpCode;
            } else {
                return null;
            }
        } else {
            throw new Error('Did not auto-fill.');
        }
    }

    async doAutoFillForLastUsedLogin(pageDetails: any, fromCommand: boolean) {
        const tab = await this.getActiveTab();
        if (!tab || !tab.url) {
            return;
        }

        const tabDomain = UtilsService.getDomain(tab.url);
        if (tabDomain == null) {
            return;
        }

        const cipher = await this.cipherService.getLastUsedForDomain(tabDomain);
        if (!cipher) {
            return;
        }

        await this.doAutoFill({
            // tslint:disable-next-line
            cipher: cipher,
            // tslint:disable-next-line
            pageDetails: pageDetails,
            fromBackground: true,
            skipTotp: !fromCommand,
            skipLastUsed: true,
            skipUsernameOnlyFill: !fromCommand,
        });
    }

    // Helpers

    private getActiveTab(): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs.length === 0) {
                    reject('No tab found.');
                } else {
                    resolve(tabs[0]);
                }
            });
        });
    }

    private generateFillScript(pageDetails: AutofillPageDetails, options: any): AutofillScript {
        if (!pageDetails || !options.cipher) {
            return null;
        }

        let fillScript = new AutofillScript(pageDetails.documentUUID);
        const filledFields: { [id: string]: AutofillField; } = {};
        const fields = options.cipher.fields;

        if (fields && fields.length) {
            const fieldNames: string[] = [];

            for (const f of fields) {
                if (f.name && f.name !== '') {
                    fieldNames.push(f.name.toLowerCase());
                } else {
                    fieldNames.push(null);
                }
            }

            for (const field of pageDetails.fields) {
                if (filledFields.hasOwnProperty(field.opid) || !field.viewable) {
                    continue;
                }

                const matchingIndex = this.findMatchingFieldIndex(field, fieldNames);
                if (matchingIndex > -1) {
                    filledFields[field.opid] = field;
                    fillScript.script.push(['click_on_opid', field.opid]);
                    fillScript.script.push(['fill_by_opid', field.opid, fields[matchingIndex].value]);
                }
            }
        }

        switch (options.cipher.type) {
            case CipherType.Login:
                fillScript = this.generateLoginFillScript(fillScript, pageDetails, filledFields, options);
                break;
            case CipherType.Card:
                fillScript = this.generateCardFillScript(fillScript, pageDetails, filledFields, options);
                break;
            case CipherType.Identity:
                fillScript = this.generateIdentityFillScript(fillScript, pageDetails, filledFields, options);
                break;
            default:
                return null;
        }

        return fillScript;
    }

    private generateLoginFillScript(fillScript: AutofillScript, pageDetails: any,
        filledFields: { [id: string]: AutofillField; },
        options: any): AutofillScript {
        if (!options.cipher.login) {
            return null;
        }

        const passwords: AutofillField[] = [];
        const usernames: AutofillField[] = [];
        let pf: AutofillField = null;
        let username: AutofillField = null;
        const login = options.cipher.login;

        if (!login.password || login.password === '') {
            // No password for this login. Maybe they just wanted to auto-fill some custom fields?
            fillScript = this.setFillScriptForFocus(filledFields, fillScript);
            return fillScript;
        }

        let passwordFields = this.loadPasswordFields(pageDetails, false);
        if (!passwordFields.length) {
            // not able to find any viewable password fields. maybe there are some "hidden" ones?
            passwordFields = this.loadPasswordFields(pageDetails, true);
        }

        for (const formKey in pageDetails.forms) {
            if (!pageDetails.forms.hasOwnProperty(formKey)) {
                continue;
            }

            const passwordFieldsForForm: AutofillField[] = [];
            for (const passField of passwordFields) {
                if (formKey === passField.form) {
                    passwordFieldsForForm.push(passField);
                }
            }

            for (const passField of passwordFields) {
                pf = passField;
                passwords.push(pf);

                if (login.username) {
                    username = this.findUsernameField(pageDetails, pf, false, false);

                    if (!username) {
                        // not able to find any viewable username fields. maybe there are some "hidden" ones?
                        username = this.findUsernameField(pageDetails, pf, true, false);
                    }

                    if (username) {
                        usernames.push(username);
                    }
                }
            }
        }

        if (passwordFields.length && !passwords.length) {
            // The page does not have any forms with password fields. Use the first password field on the page and the
            // input field just before it as the username.

            pf = passwordFields[0];
            passwords.push(pf);

            if (login.username && pf.elementNumber > 0) {
                username = this.findUsernameField(pageDetails, pf, false, true);

                if (!username) {
                    // not able to find any viewable username fields. maybe there are some "hidden" ones?
                    username = this.findUsernameField(pageDetails, pf, true, true);
                }

                if (username) {
                    usernames.push(username);
                }
            }
        }

        if (!passwordFields.length && !options.skipUsernameOnlyFill) {
            // No password fields on this page. Let's try to just fuzzy fill the username.
            for (const f of pageDetails.fields) {
                if (f.viewable && (f.type === 'text' || f.type === 'email' || f.type === 'tel') &&
                    this.fieldIsFuzzyMatch(f, UsernameFieldNames)) {
                    usernames.push(f);
                }
            }
        }

        for (const u of usernames) {
            if (filledFields.hasOwnProperty(u.opid)) {
                continue;
            }

            filledFields[u.opid] = u;
            fillScript.script.push(['click_on_opid', u.opid]);
            fillScript.script.push(['fill_by_opid', u.opid, login.username]);
        }

        for (const p of passwords) {
            if (filledFields.hasOwnProperty(p.opid)) {
                continue;
            }

            filledFields[p.opid] = p;
            fillScript.script.push(['click_on_opid', p.opid]);
            fillScript.script.push(['fill_by_opid', p.opid, login.password]);
        }

        fillScript = this.setFillScriptForFocus(filledFields, fillScript);
        return fillScript;
    }

    private generateCardFillScript(fillScript: AutofillScript, pageDetails: any,
        filledFields: { [id: string]: AutofillField; },
        options: any): AutofillScript {
        if (!options.cipher.card) {
            return null;
        }

        const fillFields: { [id: string]: AutofillField; } = {};

        for (const f of pageDetails.fields) {
            for (const attr of CardAttributes) {
                if (!f.hasOwnProperty(attr) || !f[attr] || !f.viewable) {
                    continue;
                }

                // ref https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
                // ref https://developers.google.com/web/fundamentals/design-and-ux/input/forms/
                if (!fillFields.cardholderName && this.isFieldMatch(f[attr],
                    ['cc-name', 'card-name', 'cardholder-name', 'cardholder', 'name'],
                    ['cc-name', 'card-name', 'cardholder-name', 'cardholder'])) {
                    fillFields.cardholderName = f;
                } else if (!fillFields.number && this.isFieldMatch(f[attr],
                    ['cc-number', 'cc-num', 'card-number', 'card-num', 'number'],
                    ['cc-number', 'cc-num', 'card-number', 'card-num'])) {
                    fillFields.number = f;
                } else if (!fillFields.exp && this.isFieldMatch(f[attr],
                    ['cc-exp', 'card-exp', 'cc-expiration', 'card-expiration', 'cc-ex', 'card-ex'],
                    [])) {
                    fillFields.exp = f;
                } else if (!fillFields.expMonth && this.isFieldMatch(f[attr],
                    ['exp-month', 'cc-exp-month', 'cc-month', 'card-month', 'cc-mo', 'card-mo', 'exp-mo',
                        'card-exp-mo', 'cc-exp-mo', 'card-expiration-month', 'expiration-month',
                        'cc-mm', 'card-mm', 'card-exp-mm', 'cc-exp-mm', 'exp-mm'])) {
                    fillFields.expMonth = f;
                } else if (!fillFields.expYear && this.isFieldMatch(f[attr],
                    ['exp-year', 'cc-exp-year', 'cc-year', 'card-year', 'cc-yr', 'card-yr', 'exp-yr',
                        'card-exp-yr', 'cc-exp-yr', 'card-expiration-year', 'expiration-year',
                        'cc-yy', 'card-yy', 'card-exp-yy', 'cc-exp-yy', 'exp-yy',
                        'cc-yyyy', 'card-yyyy', 'card-exp-yyyy', 'cc-exp-yyyy'])) {
                    fillFields.expYear = f;
                } else if (!fillFields.code && this.isFieldMatch(f[attr],
                    ['cvv', 'cvc', 'cvv2', 'cc-csc', 'cc-cvv', 'card-csc', 'card-cvv', 'cvd',
                        'cid', 'cvc2', 'cnv', 'cvn2', 'cc-code', 'card-code'])) {
                    fillFields.code = f;
                } else if (!fillFields.brand && this.isFieldMatch(f[attr],
                    ['cc-type', 'card-type', 'card-brand', 'cc-brand'])) {
                    fillFields.brand = f;
                }
            }
        }

        const card = options.cipher.card;
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'cardholderName');
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'number');
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'expMonth');
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'expYear');
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'code');
        this.makeScriptAction(fillScript, card, fillFields, filledFields, 'brand');

        if (fillFields.exp && card.expMonth && card.expYear) {
            let year = card.expYear;
            if (year.length === 2) {
                year = '20' + year;
            }
            const exp = year + '-' + ('0' + card.expMonth).slice(-2);

            filledFields[fillFields.exp.opid] = fillFields.exp;
            fillScript.script.push(['click_on_opid', fillFields.exp.opid]);
            fillScript.script.push(['fill_by_opid', fillFields.exp.opid, exp]);
        }

        return fillScript;
    }

    private generateIdentityFillScript(fillScript: AutofillScript, pageDetails: any,
        filledFields: { [id: string]: AutofillField; },
        options: any): AutofillScript {
        if (!options.cipher.identity) {
            return null;
        }

        const fillFields: { [id: string]: AutofillField; } = {};

        for (const f of pageDetails.fields) {
            for (const attr of IdentityAttributes) {
                if (!f.hasOwnProperty(attr) || !f[attr] || !f.viewable) {
                    continue;
                }

                // ref https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
                // ref https://developers.google.com/web/fundamentals/design-and-ux/input/forms/
                if (!fillFields.name && this.isFieldMatch(f[attr],
                    ['name', 'full-name', 'your-name'], ['full-name', 'your-name'])) {
                    fillFields.name = f;
                } else if (!fillFields.firstName && this.isFieldMatch(f[attr],
                    ['f-name', 'first-name', 'given-name', 'first-n'])) {
                    fillFields.firstName = f;
                } else if (!fillFields.middleName && this.isFieldMatch(f[attr],
                    ['m-name', 'middle-name', 'additional-name', 'middle-initial', 'middle-n', 'middle-i'])) {
                    fillFields.middleName = f;
                } else if (!fillFields.lastName && this.isFieldMatch(f[attr],
                    ['l-name', 'last-name', 's-name', 'surname', 'family-name', 'family-n', 'last-n'])) {
                    fillFields.lastName = f;
                } else if (!fillFields.title && this.isFieldMatch(f[attr],
                    ['honorific-prefix', 'prefix', 'title'])) {
                    fillFields.title = f;
                } else if (!fillFields.email && this.isFieldMatch(f[attr],
                    ['e-mail', 'email-address'])) {
                    fillFields.email = f;
                } else if (!fillFields.address && this.isFieldMatch(f[attr],
                    ['address', 'street-address'], [])) {
                    fillFields.address = f;
                } else if (!fillFields.address1 && this.isFieldMatch(f[attr],
                    ['address-1', 'address-line-1'])) {
                    fillFields.address1 = f;
                } else if (!fillFields.address2 && this.isFieldMatch(f[attr],
                    ['address-2', 'address-line-2'])) {
                    fillFields.address2 = f;
                } else if (!fillFields.address3 && this.isFieldMatch(f[attr],
                    ['address-3', 'address-line-3'])) {
                    fillFields.address3 = f;
                } else if (!fillFields.city && this.isFieldMatch(f[attr],
                    ['city', 'town', 'address-level-2', 'address-city', 'address-town'])) {
                    fillFields.city = f;
                } else if (!fillFields.state && this.isFieldMatch(f[attr],
                    ['state', 'province', 'provence', 'address-level-1', 'address-state',
                        'address-province'])) {
                    fillFields.state = f;
                } else if (!fillFields.postalCode && this.isFieldMatch(f[attr],
                    ['postal', 'zip', 'zip2', 'zip-code', 'postal-code', 'address-zip', 'address-postal',
                        'address-code', 'address-postal-code', 'address-zip-code'])) {
                    fillFields.postalCode = f;
                } else if (!fillFields.country && this.isFieldMatch(f[attr],
                    ['country', 'country-code', 'country-name', 'address-country', 'address-country-name',
                        'address-country-code'])) {
                    fillFields.country = f;
                } else if (!fillFields.phone && this.isFieldMatch(f[attr],
                    ['phone', 'mobile', 'mobile-phone', 'tel', 'telephone', 'phone-number'])) {
                    fillFields.phone = f;
                } else if (!fillFields.username && this.isFieldMatch(f[attr],
                    ['user-name', 'user-id', 'screen-name'])) {
                    fillFields.username = f;
                } else if (!fillFields.company && this.isFieldMatch(f[attr],
                    ['company', 'company-name', 'organization', 'organization-name'])) {
                    fillFields.company = f;
                }
            }
        }

        const identity = options.cipher.identity;
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'title');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'firstName');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'middleName');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'lastName');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address1');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address2');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address3');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'city');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'postalCode');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'company');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'email');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'phone');
        this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'username');

        let filledState = false;
        if (fillFields.state && identity.state && identity.state.length > 2) {
            const stateLower = identity.state.toLowerCase();
            const isoState = IsoStates[stateLower] || IsoProvinces[stateLower];
            if (isoState) {
                filledState = true;
                filledFields[fillFields.state.opid] = fillFields.state;
                fillScript.script.push(['click_on_opid', fillFields.state.opid]);
                fillScript.script.push(['fill_by_opid', fillFields.state.opid, isoState]);
            }
        }

        if (!filledState) {
            this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'state');
        }

        let filledCountry = false;
        if (fillFields.country && identity.country && identity.country.length > 2) {
            const countryLower = identity.country.toLowerCase();
            const isoCountry = IsoCountries[countryLower];
            if (isoCountry) {
                filledCountry = true;
                filledFields[fillFields.country.opid] = fillFields.country;
                fillScript.script.push(['click_on_opid', fillFields.country.opid]);
                fillScript.script.push(['fill_by_opid', fillFields.country.opid, isoCountry]);
            }
        }

        if (!filledCountry) {
            this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'country');
        }

        if (fillFields.name && (identity.firstName || identity.lastName)) {
            let fullName = '';
            if (identity.firstName && identity.firstName !== '') {
                fullName = identity.firstName;
            }
            if (identity.middleName && identity.middleName !== '') {
                if (fullName !== '') {
                    fullName += ' ';
                }
                fullName += identity.middleName;
            }
            if (identity.lastName && identity.lastName !== '') {
                if (fullName !== '') {
                    fullName += ' ';
                }
                fullName += identity.lastName;
            }

            filledFields[fillFields.name.opid] = fillFields.name;
            fillScript.script.push(['click_on_opid', fillFields.name.opid]);
            fillScript.script.push(['fill_by_opid', fillFields.name.opid, fullName]);
        }

        if (fillFields.address && identity.address1 && identity.address1 !== '') {
            let address = '';
            if (identity.address1 && identity.address1 !== '') {
                address = identity.address1;
            }
            if (identity.address2 && identity.address2 !== '') {
                if (address !== '') {
                    address += ', ';
                }
                address += identity.address2;
            }
            if (identity.address3 && identity.address3 !== '') {
                if (address !== '') {
                    address += ', ';
                }
                address += identity.address3;
            }

            filledFields[fillFields.address.opid] = fillFields.address;
            fillScript.script.push(['click_on_opid', fillFields.address.opid]);
            fillScript.script.push(['fill_by_opid', fillFields.address.opid, address]);
        }

        return fillScript;
    }

    private isFieldMatch(value: string, options: string[], containsOptions?: string[]): boolean {
        value = value.trim().toLowerCase().replace(/[^a-zA-Z]+/g, '');
        for (let option of options) {
            const checkValueContains = containsOptions == null || containsOptions.indexOf(option) > -1;
            option = option.replace(/-/g, '');
            if (value === option || (checkValueContains && value.indexOf(option) > -1)) {
                return true;
            }
        }

        return false;
    }

    private makeScriptAction(fillScript: AutofillScript, cipherData: any, fillFields: any,
        filledFields: { [id: string]: AutofillField; }, dataProp: string,
        fieldProp?: string) {
        fieldProp = fieldProp || dataProp;
        if (cipherData[dataProp] && cipherData[dataProp] !== '' && fillFields[fieldProp]) {
            filledFields[fillFields[fieldProp].opid] = fillFields[fieldProp];
            fillScript.script.push(['click_on_opid', fillFields[fieldProp].opid]);
            fillScript.script.push(['fill_by_opid', fillFields[fieldProp].opid, cipherData[dataProp]]);
        }
    }

    private loadPasswordFields(pageDetails: AutofillPageDetails, canBeHidden: boolean) {
        const arr: AutofillField[] = [];
        for (const f of pageDetails.fields) {
            if (f.type === 'password' && (canBeHidden || f.viewable)) {
                arr.push(f);
            }
        }

        return arr;
    }

    private findUsernameField(pageDetails: AutofillPageDetails, passwordField: AutofillField, canBeHidden: boolean,
        withoutForm: boolean) {
        let usernameField: AutofillField = null;
        for (const f of pageDetails.fields) {
            if (f.elementNumber >= passwordField.elementNumber) {
                break;
            }

            if ((withoutForm || f.form === passwordField.form) && (canBeHidden || f.viewable) &&
                (f.type === 'text' || f.type === 'email' || f.type === 'tel')) {
                usernameField = f;

                if (this.findMatchingFieldIndex(f, UsernameFieldNames) > -1) {
                    // We found an exact match. No need to keep looking.
                    break;
                }
            }
        }

        return usernameField;
    }

    private findMatchingFieldIndex(field: AutofillField, names: string[]): number {
        for (let i = 0; i < names.length; i++) {
            if (this.fieldPropertyIsMatch(field, 'htmlID', names[i])) {
                return i;
            }
            if (this.fieldPropertyIsMatch(field, 'htmlName', names[i])) {
                return i;
            }
            if (this.fieldPropertyIsMatch(field, 'label-tag', names[i])) {
                return i;
            }
            if (this.fieldPropertyIsMatch(field, 'placeholder', names[i])) {
                return i;
            }
        }

        return -1;
    }

    private fieldPropertyIsMatch(field: any, property: string, name: string): boolean {
        let fieldVal = field[property] as string;
        if (fieldVal == null || fieldVal === '') {
            return false;
        }

        fieldVal = fieldVal.trim().replace(/(?:\r\n|\r|\n)/g, '');
        if (name.startsWith('regex=')) {
            try {
                const regexParts = name.split('=', 2);
                if (regexParts.length === 2) {
                    const regex = new RegExp(regexParts[1], 'i');
                    return regex.test(fieldVal);
                }
            } catch (e) { }
        } else if (name.startsWith('csv=')) {
            const csvParts = name.split('=', 2);
            if (csvParts.length === 2) {
                const csvVals = csvParts[1].split(',');
                for (const val of csvVals) {
                    if (val != null && val.trim().toLowerCase() === fieldVal.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            }
        }

        return fieldVal.toLowerCase() === name;
    }

    private fieldIsFuzzyMatch(field: AutofillField, names: string[]): boolean {
        if (field.htmlID != null && field.htmlID !== '' && this.fuzzyMatch(names, field.htmlID.toLowerCase())) {
            return true;
        }
        if (field.htmlName != null && field.htmlName !== '' && this.fuzzyMatch(names, field.htmlName.toLowerCase())) {
            return true;
        }
        if (field['label-tag'] != null && field['label-tag'] !== '' &&
            this.fuzzyMatch(names, field['label-tag'].replace(/(?:\r\n|\r|\n)/g, '').trim().toLowerCase())) {
            return true;
        }
        if (field.placeholder != null && field.placeholder !== '' &&
            this.fuzzyMatch(names, field.placeholder.toLowerCase())) {
            return true;
        }

        return false;
    }

    private fuzzyMatch(options: string[], value: string): boolean {
        if (options == null || options.length === 0 || value == null || value === '') {
            return false;
        }

        for (const o of options) {
            if (value.indexOf(o) > -1) {
                return true;
            }
        }

        return false;
    }

    private setFillScriptForFocus(filledFields: { [id: string]: AutofillField; },
        fillScript: AutofillScript): AutofillScript {
        let lastField: AutofillField = null;
        let lastPasswordField: AutofillField = null;

        for (const opid in filledFields) {
            if (filledFields.hasOwnProperty(opid) && filledFields[opid].viewable) {
                lastField = filledFields[opid];

                if (filledFields[opid].type === 'password') {
                    lastPasswordField = filledFields[opid];
                }
            }
        }

        // Prioritize password field over others.
        if (lastPasswordField) {
            fillScript.script.push(['focus_by_opid', lastPasswordField.opid]);
        } else if (lastField) {
            fillScript.script.push(['focus_by_opid', lastField.opid]);
        }

        return fillScript;
    }
}
