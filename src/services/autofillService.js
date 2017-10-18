function AutofillService(utilsService, totpService, tokenService, cipherService, constantsService) {
    this.utilsService = utilsService;
    this.totpService = totpService;
    this.tokenService = tokenService;
    this.cipherService = cipherService;
    this.constantsService = constantsService;

    initAutofill();
}

function initAutofill() {
    var cardAttributes = ['autoCompleteType', 'data-stripe', 'htmlName', 'htmlID'];
    var identityAttributes = ['autoCompleteType', 'data-stripe', 'htmlName', 'htmlID'];

    // Add other languages values
    var usernameFieldNames = ['username', 'user name', 'email', 'email address', 'e-mail', 'e-mail address',
        'userid', 'user id'];

    AutofillService.prototype.getFormsWithPasswordFields = function (pageDetails) {
        var passwordFields = [],
            formData = [];

        passwordFields = loadPasswordFields(pageDetails, true);
        if (passwordFields.length) {
            for (var formKey in pageDetails.forms) {
                for (var i = 0; i < passwordFields.length; i++) {
                    var pf = passwordFields[i];
                    if (formKey === pf.form) {
                        var uf = findUsernameField(pageDetails, pf, false, false);
                        if (!uf) {
                            // not able to find any viewable username fields. maybe there are some "hidden" ones?
                            uf = findUsernameField(pageDetails, pf, true, false);
                        }

                        formData.push({
                            form: pageDetails.forms[formKey],
                            password: pf,
                            username: uf
                        });
                        break;
                    }
                }
            }
        }

        return formData;
    };

    AutofillService.prototype.doAutoFill = function (options) {
        var deferred = Q.defer();
        var self = this,
            totpPromise = null;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = null;
            if (tabs.length > 0) {
                tab = tabs[0];
            }
            else {
                deferred.reject();
                return;
            }

            if (!tab || !options.cipher || !options.pageDetails || !options.pageDetails.length) {
                deferred.reject();
                return;
            }

            var didAutofill = false;
            for (var i = 0; i < options.pageDetails.length; i++) {
                // make sure we're still on correct tab
                if (options.pageDetails[i].tab.id !== tab.id || options.pageDetails[i].tab.url !== tab.url) {
                    continue;
                }

                var fillScript = generateFillScript(self, options.pageDetails[i].details, {
                    skipUsernameOnlyFill: options.skipUsernameOnlyFill || false,
                    cipher: options.cipher
                });
                if (!fillScript || !fillScript.script || !fillScript.script.length) {
                    continue;
                }

                didAutofill = true;
                if (!options.skipLastUsed) {
                    self.cipherService.updateLastUsedDate(options.cipher.id);
                }

                chrome.tabs.sendMessage(tab.id, {
                    command: 'fillForm',
                    fillScript: fillScript
                }, { frameId: options.pageDetails[i].frameId });

                if (options.cipher.type !== self.constantsService.cipherType.login || totpPromise ||
                    (options.fromBackground && self.utilsService.isFirefox()) || options.skipTotp ||
                    !options.cipher.login.totp || !self.tokenService.getPremium()) {
                    continue;
                }

                totpPromise = self.totpService.isAutoCopyEnabled().then(function (enabled) {
                    if (enabled) {
                        /* jshint ignore:start */
                        return self.totpService.getCode(options.cipher.login.totp);
                        /* jshint ignore:end */
                    }

                    return null;
                }).then(function (code) {
                    if (code) {
                        /* jshint ignore:start */
                        self.utilsService.copyToClipboard(code);
                        /* jshint ignore:end */
                    }

                    return code;
                });
            }

            if (didAutofill) {
                if (totpPromise) {
                    totpPromise.then(function (totpCode) {
                        deferred.resolve(totpCode);
                    });
                }
                else {
                    deferred.resolve();
                }
            }
            else {
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    AutofillService.prototype.doAutoFillForLastUsedLogin = function (pageDetails, fromCommand) {
        var self = this;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = null;
            if (tabs.length > 0) {
                tab = tabs[0];
            }

            if (!tab || !tab.url) {
                return;
            }

            var tabDomain = self.utilsService.getDomain(tab.url);
            if (!tabDomain) {
                return;
            }

            self.cipherService.getLastUsedForDomain(tabDomain).then(function (cipher) {
                if (!cipher) {
                    return;
                }

                self.doAutoFill({
                    cipher: cipher,
                    pageDetails: pageDetails,
                    fromBackground: true,
                    skipTotp: !fromCommand,
                    skipLastUsed: true,
                    skipUsernameOnlyFill: !fromCommand
                });
            });
        });
    };

    function generateFillScript(self, pageDetails, options) {
        if (!pageDetails || !options.cipher) {
            return null;
        }

        var fillScript = {
            documentUUID: pageDetails.documentUUID,
            script: [],
            autosubmit: null,
            properties: {},
            options: {},
            metadata: {}
        };

        var filledFields = {},
            i = 0,
            fields = options.cipher.fields;

        if (fields && fields.length) {
            var fieldNames = [];

            for (i = 0; i < fields.length; i++) {
                if (fields[i].name && fields[i].name !== '') {
                    fieldNames.push(fields[i].name.toLowerCase());
                }
                else {
                    fieldNames.push(null);
                }
            }

            for (i = 0; i < pageDetails.fields.length; i++) {
                var field = pageDetails.fields[i];
                if (filledFields.hasOwnProperty(field.opid) || !field.viewable) {
                    continue;
                }

                var matchingIndex = findMatchingFieldIndex(field, fieldNames);
                if (matchingIndex > -1) {
                    filledFields[field.opid] = field;
                    fillScript.script.push(['click_on_opid', field.opid]);
                    fillScript.script.push(['fill_by_opid', field.opid, fields[matchingIndex].value]);
                }
            }
        }

        switch (options.cipher.type) {
            case self.constantsService.cipherType.login:
                fillScript = generateLoginFillScript(fillScript, pageDetails, filledFields, options);
                break;
            case self.constantsService.cipherType.card:
                fillScript = generateCardFillScript(fillScript, pageDetails, filledFields, options);
                break;
            case self.constantsService.cipherType.identity:
                fillScript = generateIdentityFillScript(fillScript, pageDetails, filledFields, options);
                break;
            default:
                return null;
        }

        return fillScript;
    }

    function generateLoginFillScript(fillScript, pageDetails, filledFields, options) {
        if (!options.cipher.login) {
            return null;
        }

        var passwordFields = [],
            passwords = [],
            usernames = [],
            pf = null,
            username = null,
            i = 0,
            login = options.cipher.login;

        if (!login.password || login.password === '') {
            // No password for this login. Maybe they just wanted to auto-fill some custom fields?
            fillScript = setFillScriptForFocus(filledFields, fillScript);
            return fillScript;
        }

        passwordFields = loadPasswordFields(pageDetails, false);
        if (!passwordFields.length) {
            // not able to find any viewable password fields. maybe there are some "hidden" ones?
            passwordFields = loadPasswordFields(pageDetails, true);
        }

        for (var formKey in pageDetails.forms) {
            var passwordFieldsForForm = [];
            for (i = 0; i < passwordFields.length; i++) {
                if (formKey === passwordFields[i].form) {
                    passwordFieldsForForm.push(passwordFields[i]);
                }
            }

            for (i = 0; i < passwordFieldsForForm.length; i++) {
                pf = passwordFieldsForForm[i];
                passwords.push(pf);

                if (login.username) {
                    username = findUsernameField(pageDetails, pf, false, false);

                    if (!username) {
                        // not able to find any viewable username fields. maybe there are some "hidden" ones?
                        username = findUsernameField(pageDetails, pf, true, false);
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
                username = findUsernameField(pageDetails, pf, false, true);

                if (!username) {
                    // not able to find any viewable username fields. maybe there are some "hidden" ones?
                    username = findUsernameField(pageDetails, pf, true, true);
                }

                if (username) {
                    usernames.push(username);
                }
            }
        }

        if (!passwordFields.length && !options.skipUsernameOnlyFill) {
            // No password fields on this page. Let's try to just fuzzy fill the username.
            for (i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.viewable && (f.type === 'text' || f.type === 'email' || f.type === 'tel') &&
                    fieldIsFuzzyMatch(f, usernameFieldNames)) {
                    usernames.push(f);
                }
            }
        }

        for (i = 0; i < usernames.length; i++) {
            if (filledFields.hasOwnProperty(usernames[i].opid)) {
                continue;
            }

            filledFields[usernames[i].opid] = usernames[i];
            fillScript.script.push(['click_on_opid', usernames[i].opid]);
            fillScript.script.push(['fill_by_opid', usernames[i].opid, login.username]);
        }

        for (i = 0; i < passwords.length; i++) {
            if (filledFields.hasOwnProperty(passwords[i].opid)) {
                continue;
            }

            filledFields[passwords[i].opid] = passwords[i];
            fillScript.script.push(['click_on_opid', passwords[i].opid]);
            fillScript.script.push(['fill_by_opid', passwords[i].opid, login.password]);
        }

        fillScript = setFillScriptForFocus(filledFields, fillScript);
        return fillScript;
    }

    function generateCardFillScript(fillScript, pageDetails, filledFields, options) {
        if (!options.cipher.card) {
            return null;
        }

        var fillFields = {};

        for (var i = 0; i < pageDetails.fields.length; i++) {
            var f = pageDetails.fields[i];
            for (var j = 0; j < cardAttributes.length; j++) {
                var attr = cardAttributes[j];
                if (f.hasOwnProperty(attr) && f[attr]) {
                    // ref https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
                    // ref https://developers.google.com/web/fundamentals/design-and-ux/input/forms/
                    switch (f[attr].toLowerCase()) {
                        case 'cc-name': case 'ccname': case 'cardname': case 'card-name': case 'cardholder':
                        case 'cardholdername': case 'cardholder-name': case 'name':
                            if (!fillFields.cardholderName) {
                                fillFields.cardholderName = f;
                            }
                            break;
                        case 'cc-number': case 'ccnumber': case 'cardnumber': case 'card-number': case 'number':
                            if (!fillFields.number) {
                                fillFields.number = f;
                            }
                            break;
                        case 'cc-exp': case 'ccexp': case 'cardexp': case 'card-exp': case 'cc-expiration':
                        case 'ccexpiration': case 'card-expiration': case 'cardexpiration':
                            if (!fillFields.exp) {
                                fillFields.exp = f;
                            }
                            break;
                        case 'exp-month': case 'expmonth': case 'ccexpmonth': case 'cc-exp-month': case 'cc-month':
                        case 'ccmonth': case 'card-month': case 'cardmonth':
                            if (!fillFields.expMonth) {
                                fillFields.expMonth = f;
                            }
                            break;
                        case 'exp-year': case 'expyear': case 'ccexpyear': case 'cc-exp-year': case 'cc-year': case 'ccyear':
                        case 'card-year': case 'cardyear':
                            if (!fillFields.expYear) {
                                fillFields.expYear = f;
                            }
                            break;
                        case 'cvc': case 'cvv': case 'cvv2': case 'cc-csc': case 'cc-cvv': case 'card-csc': case 'cardcsc':
                        case 'cvd': case 'cid': case 'cvc2': case 'cvn': case 'cvn2':
                            if (!fillFields.code) {
                                fillFields.code = f;
                            }
                            break;
                        case 'card-type': case 'cc-type': case 'cardtype': case 'cctype':
                            if (!fillFields.brand) {
                                fillFields.brand = f;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        var card = options.cipher.card;
        makeScriptAction(fillScript, card, fillFields, filledFields, 'cardholderName');
        makeScriptAction(fillScript, card, fillFields, filledFields, 'number');
        makeScriptAction(fillScript, card, fillFields, filledFields, 'expMonth');
        makeScriptAction(fillScript, card, fillFields, filledFields, 'expYear');
        makeScriptAction(fillScript, card, fillFields, filledFields, 'code');
        makeScriptAction(fillScript, card, fillFields, filledFields, 'brand');

        if (fillFields.exp && card.expMonth && card.expYear) {
            var year = card.expYear;
            if (year.length == 2) {
                year = '20' + year;
            }
            var exp = year + '-' + ('0' + card.expMonth).slice(-2);

            filledFields[fillFields.exp.opid] = fillFields.exp;
            fillScript.script.push(['click_on_opid', fillFields.exp.opid]);
            fillScript.script.push(['fill_by_opid', fillFields.exp.opid, exp]);
        }

        return fillScript;
    }

    function generateIdentityFillScript(fillScript, pageDetails, filledFields, options) {
        if (!options.cipher.identity) {
            return null;
        }

        var fillFields = {};

        for (var i = 0; i < pageDetails.fields.length; i++) {
            var f = pageDetails.fields[i];
            for (var j = 0; j < identityAttributes.length; j++) {
                var attr = identityAttributes[j];
                if (f.hasOwnProperty(attr) && f[attr]) {
                    // ref https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
                    // ref https://developers.google.com/web/fundamentals/design-and-ux/input/forms/
                    switch (f[attr].toLowerCase()) {
                        case 'name': case 'full-name': case 'fullname': case 'your-name': case 'yourname': case 'full_name':
                        case 'your_name':
                            if (!fillFields.name) {
                                fillFields.name = f;
                            }
                            break;
                        case 'fname': case 'firstname': case 'first-name': case 'given-name': case 'givenname':
                        case 'first_name': case 'given_name':
                            if (!fillFields.firstName) {
                                fillFields.firstName = f;
                            }
                            break;
                        case 'mname': case 'middlename': case 'middle-name': case 'additional-name': case 'additionalname':
                        case 'middle_name': case 'additional_name':
                            if (!fillFields.middleName) {
                                fillFields.middleName = f;
                            }
                            break;
                        case 'lname': case 'lastname': case 'last-name': case 'family-name': case 'familyname': case 'surname':
                        case 'sname': case 'last_name': case 'family_name':
                            if (!fillFields.lastName) {
                                fillFields.lastName = f;
                            }
                            break;
                        case 'honorific-prefix': case 'prefix': case 'honorific_prefix':
                            if (!fillFields.title) {
                                fillFields.title = f;
                            }
                            break;
                        case 'email': case 'e-mail': case 'email-address': case 'emailaddress': case 'email_address':
                            if (!fillFields.email) {
                                fillFields.email = f;
                            }
                            break;
                        case 'address': case 'street_address': case 'street-address': case 'streetaddress':
                            if (!fillFields.address) {
                                fillFields.address = f;
                            }
                            break;
                        case 'address1': case 'address-1': case 'address-line1': case 'address_1': case 'address_line1':
                            if (!fillFields.address1) {
                                fillFields.address1 = f;
                            }
                            break;
                        case 'address2': case 'address-2': case 'address-line2': case 'address_2': case 'address_line2':
                            if (!fillFields.address2) {
                                fillFields.address2 = f;
                            }
                            break;
                        case 'address3': case 'address-3': case 'address-line3': case 'address_3': case 'address_line3':
                            if (!fillFields.address3) {
                                fillFields.address3 = f;
                            }
                            break;
                        case 'city': case 'town': case 'address-level2': case 'address_level2': case 'address_city':
                        case 'address_town': case 'address-city':
                            if (!fillFields.city) {
                                fillFields.city = f;
                            }
                            break;
                        case 'state': case 'province': case 'provence': case 'address-level1': case 'address_level1':
                        case 'address_state': case 'address_province': case 'address-state': case 'address-province':
                            if (!fillFields.state) {
                                fillFields.state = f;
                            }
                            break;
                        case 'postal': case 'postal-code': case 'zip': case 'zip2': case 'zip-code': case 'zipcode':
                        case 'postalcode': case 'postal_code': case 'zip_code': case 'address_zip': case 'address_postal':
                        case 'address-postal-code': case 'address_postal_code': case 'address_code': case 'address_postalcode':
                        case 'address_zip_code':
                            if (!fillFields.postalCode) {
                                fillFields.postalCode = f;
                            }
                            break;
                        case 'country': case 'country-code': case 'countrycode': case 'countryname': case 'country-name':
                        case 'country_name': case 'country_code': case 'address_country': case 'address-country':
                        case 'address-countryname': case 'address-countrycode': case 'address_countryname':
                        case 'address_countrycode':
                            if (!fillFields.country) {
                                fillFields.country = f;
                            }
                            break;
                        case 'phone': case 'mobile': case 'mobile-phone': case 'tel': case 'telephone': case 'mobile_phone':
                            if (!fillFields.phone) {
                                fillFields.phone = f;
                            }
                            break;
                        case 'username': case 'user-name': case 'userid': case 'user-id': case 'user_name': case 'user_id':
                            if (!fillFields.username) {
                                fillFields.username = f;
                            }
                            break;
                        case 'company': case 'organization': case 'organisation': case 'company_name': case 'organization_name':
                            if (!fillFields.company) {
                                fillFields.company = f;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        var identity = options.cipher.identity;
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'title');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'firstName');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'middleName');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'lastName');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'address1');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'address2');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'address3');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'city');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'state');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'postalCode');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'country');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'company');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'email');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'phone');
        makeScriptAction(fillScript, identity, fillFields, filledFields, 'username');

        if (fillFields.name && (identity.firstName || identity.lastName)) {
            var fullName = '';
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
            var address = '';
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

    function makeScriptAction(fillScript, cipherData, fillFields, filledFields, dataProp, fieldProp) {
        fieldProp = fieldProp || dataProp;
        if (cipherData[dataProp] && cipherData[dataProp] !== '' && fillFields[fieldProp]) {
            filledFields[fillFields[fieldProp].opid] = fillFields[fieldProp];
            fillScript.script.push(['click_on_opid', fillFields[fieldProp].opid]);
            fillScript.script.push(['fill_by_opid', fillFields[fieldProp].opid, cipherData[dataProp]]);
        }
    }

    function loadPasswordFields(pageDetails, canBeHidden) {
        var arr = [];
        for (var i = 0; i < pageDetails.fields.length; i++) {
            if (pageDetails.fields[i].type === 'password' && (canBeHidden || pageDetails.fields[i].viewable)) {
                arr.push(pageDetails.fields[i]);
            }
        }

        return arr;
    }

    function findUsernameField(pageDetails, passwordField, canBeHidden, withoutForm) {
        var usernameField = null;
        for (var i = 0; i < pageDetails.fields.length; i++) {
            var f = pageDetails.fields[i];
            if (f.elementNumber >= passwordField.elementNumber) {
                break;
            }

            if ((withoutForm || f.form === passwordField.form) && (canBeHidden || f.viewable) &&
                (f.type === 'text' || f.type === 'email' || f.type === 'tel')) {
                usernameField = f;

                if (findMatchingFieldIndex(f, usernameFieldNames) > -1) {
                    // We found an exact match. No need to keep looking.
                    break;
                }
            }
        }

        return usernameField;
    }

    function findMatchingFieldIndex(field, names) {
        var matchingIndex = -1;
        if (field.htmlID && field.htmlID !== '') {
            matchingIndex = names.indexOf(field.htmlID.toLowerCase());
        }
        if (matchingIndex < 0 && field.htmlName && field.htmlName !== '') {
            matchingIndex = names.indexOf(field.htmlName.toLowerCase());
        }
        if (matchingIndex < 0 && field['label-tag'] && field['label-tag'] !== '') {
            matchingIndex = names.indexOf(field['label-tag'].replace(/(?:\r\n|\r|\n)/g, '').trim().toLowerCase());
        }
        if (matchingIndex < 0 && field.placeholder && field.placeholder !== '') {
            matchingIndex = names.indexOf(field.placeholder.toLowerCase());
        }

        return matchingIndex;
    }

    function fieldIsFuzzyMatch(field, names) {
        if (field.htmlID && field.htmlID !== '' && fuzzyMatch(names, field.htmlID.toLowerCase())) {
            return true;
        }
        if (field.htmlName && field.htmlName !== '' && fuzzyMatch(names, field.htmlName.toLowerCase())) {
            return true;
        }
        if (field['label-tag'] && field['label-tag'] !== '' &&
            fuzzyMatch(names, field['label-tag'].replace(/(?:\r\n|\r|\n)/g, '').trim().toLowerCase())) {
            return true;
        }
        if (field.placeholder && field.placeholder !== '' && fuzzyMatch(names, field.placeholder.toLowerCase())) {
            return true;
        }

        return false;
    }

    function fuzzyMatch(options, value) {
        if (!options || !options.length || !value || value === '') {
            return false;
        }

        for (var i = 0; i < options.length; i++) {
            if (value.indexOf(options[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    function setFillScriptForFocus(filledFields, fillScript) {
        var lastField = null,
            lastPasswordField = null;

        for (var opid in filledFields) {
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
        }
        else if (lastField) {
            fillScript.script.push(['focus_by_opid', lastField.opid]);
        }

        return fillScript;
    }
}
