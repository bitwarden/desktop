function AutofillService(utilsService, totpService, tokenService, loginService) {
    this.utilsService = utilsService;
    this.totpService = totpService;
    this.tokenService = tokenService;
    this.loginService = loginService;

    initAutofill();
}

function initAutofill() {
    AutofillService.prototype.generateFillScript = function (pageDetails, fillUsername, fillPassword) {
        if (!pageDetails || !fillPassword || fillPassword === '') {
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
            pf = null,
            username = null;

        passwordFields = loadPasswordFields(pageDetails, false);
        if (!passwordFields.length) {
            // not able to find any viewable password fields. maybe there are some "hidden" ones?
            passwordFields = loadPasswordFields(pageDetails, true);
        }

        var i;
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

                if (fillUsername) {
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

            if (fillUsername && pf.elementNumber > 0) {
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

        for (i = 0; i < usernames.length; i++) {
            fillScript.script.push(['click_on_opid', usernames[i].opid]);
            fillScript.script.push(['fill_by_opid', usernames[i].opid, fillUsername]);
        }

        for (i = 0; i < passwords.length; i++) {
            fillScript.script.push(['click_on_opid', passwords[i].opid]);
            fillScript.script.push(['fill_by_opid', passwords[i].opid, fillPassword]);
        }

        if (passwords.length) {
            fillScript.autosubmit = { focusOpid: passwords[0].opid };
        }

        return fillScript;
    };

    AutofillService.prototype.getFormsWithPasswordFields = function (pageDetails) {
        var passwordFields = [],
            formData = [];

        passwordFields = loadPasswordFields(pageDetails, false);
        if (!passwordFields.length) {
            // not able to find any viewable password fields. maybe there are some "hidden" ones?
            passwordFields = loadPasswordFields(pageDetails, true);
        }

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
        var self = this;

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

                var fillScript = self.generateFillScript(pageDetails[i].details,
                    login.username, login.password);
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

                if ((fromBackground && self.utilsService.isFirefox()) ||
                    skipTotp || !login.totp || !self.tokenService.getPremium()) {
                    deferred.resolve();
                    return;
                }

                self.totpService.isAutoCopyEnabled().then(function (enabled) {
                    if (enabled) {
                        return self.totpService.getCode(login.totp);
                    }

                    return null;
                }).then(function (code) {
                    if (code) {
                        self.utilsService.copyToClipboard(code);
                    }

                    deferred.resolve();
                    return;
                });

                break;
            }

            if (!didAutofill) {
                deferred.reject();
                return;
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

            self.loginService.getAllDecryptedForDomain(tabDomain).then(function (logins) {
                if (!logins.length) {
                    return;
                }

                var sortedLogins = logins.sort(self.loginService.sortLoginsByLastUsed);
                self.doAutoFill(sortedLogins[0], pageDetails, true, true, true);
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
            }
        }

        return usernameField;
    }
}
