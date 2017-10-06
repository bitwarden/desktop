function AutofillService(utilsService, totpService, tokenService, loginService) {
    this.utilsService = utilsService;
    this.totpService = totpService;
    this.tokenService = tokenService;
    this.loginService = loginService;

    initAutofill();
}

function initAutofill() {
    // Add other languages to this array
    var usernameFieldNames = ['username', 'user name', 'email', 'email address', 'e-mail', 'e-mail address',
        'userid', 'user id'];

    AutofillService.prototype.generateFillScript = function (pageDetails, fill) {
        if (!pageDetails) {
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

        var passwordFields = [],
            passwords = [],
            usernames = [],
            filledFields = {},
            pf = null,
            username = null,
            i = 0;

        if (fill.fields && fill.fields.length) {
            var fieldNames = [];

            for (i = 0; i < fill.fields.length; i++) {
                if (fill.fields[i].name && fill.fields[i].name !== '') {
                    fieldNames.push(fill.fields[i].name.toLowerCase());
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
                    fillScript.script.push(['fill_by_opid', field.opid, fill.fields[matchingIndex].value]);
                }
            }
        }

        if (!fill.password || fill.password === '') {
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

                if (fill.username) {
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

            if (fill.username && pf.elementNumber > 0) {
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

        if (!passwordFields.length) {
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
            fillScript.script.push(['fill_by_opid', usernames[i].opid, fill.username]);
        }

        for (i = 0; i < passwords.length; i++) {
            if (filledFields.hasOwnProperty(passwords[i].opid)) {
                continue;
            }

            filledFields[passwords[i].opid] = passwords[i];
            fillScript.script.push(['click_on_opid', passwords[i].opid]);
            fillScript.script.push(['fill_by_opid', passwords[i].opid, fill.password]);
        }

        fillScript = setFillScriptForFocus(filledFields, fillScript);
        return fillScript;
    };

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

    AutofillService.prototype.doAutoFill = function (login, pageDetails, fromBackground, skipTotp, skipLastUsed) {
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

            if (!tab || !login || !pageDetails || !pageDetails.length) {
                deferred.reject();
                return;
            }

            var didAutofill = false;
            for (var i = 0; i < pageDetails.length; i++) {
                // make sure we're still on correct tab
                if (pageDetails[i].tab.id !== tab.id || pageDetails[i].tab.url !== tab.url) {
                    continue;
                }

                var fillScript = self.generateFillScript(pageDetails[i].details, {
                    username: login.username,
                    password: login.password,
                    fields: login.fields
                });

                if (!fillScript || !fillScript.script || !fillScript.script.length) {
                    continue;
                }

                didAutofill = true;
                if (!skipLastUsed) {
                    self.loginService.updateLastUsedDate(login.id, function () { });
                }

                chrome.tabs.sendMessage(tab.id, {
                    command: 'fillForm',
                    fillScript: fillScript
                }, { frameId: pageDetails[i].frameId });

                if (totpPromise || (fromBackground && self.utilsService.isFirefox()) ||
                    skipTotp || !login.totp || !self.tokenService.getPremium()) {
                    continue;
                }

                totpPromise = self.totpService.isAutoCopyEnabled().then(function (enabled) {
                    if (enabled) {
                        /* jshint ignore:start */
                        return self.totpService.getCode(login.totp);
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

    AutofillService.prototype.doAutoFillForLastUsedLogin = function (pageDetails) {
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

            self.loginService.getLastUsedForDomain(tabDomain).then(function (login) {
                if (!login) {
                    return;
                }

                self.doAutoFill(login, pageDetails, true, true, true);
            });
        });
    };

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
