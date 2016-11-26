function AutofillService() {
    initAutofill();
};

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

        function loadPasswordFields(canBeHidden) {
            for (var i = 0; i < pageDetails.fields.length; i++) {
                if (pageDetails.fields[i].type === 'password' && (canBeHidden || pageDetails.fields[i].viewable)) {
                    passwordFields.push(pageDetails.fields[i]);
                }
            }
        }

        loadPasswordFields(false);
        if (!passwordFields.length) {
            // not able to find any visible password fields. maybe there are some "hidden" ones?
            loadPasswordFields(true);
        }

        function findUsernameField(passwordField, canBeHidden) {
            for (var i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.form === passwordField.form && (canBeHidden || f.viewable)
                    && (f.type === 'text' || f.type === 'email' || f.type === 'tel')
                    && f.elementNumber < passwordField.elementNumber) {
                    return f;
                }
            }

            return null;
        }

        for (var formKey in pageDetails.forms) {
            var passwordFieldsForForm = [];
            for (var i = 0; i < passwordFields.length; i++) {
                if (formKey === passwordFields[i].form) {
                    passwordFieldsForForm.push(passwordFields[i]);
                }
            }

            for (i = 0; i < passwordFieldsForForm.length; i++) {
                pf = passwordFieldsForForm[i];
                passwords.push(pf);

                if (fillUsername) {
                    username = findUsernameField(pf, false);

                    if (!username) {
                        // not able to find any visible username fields. maybe there are some "hidden" ones?
                        username = findUsernameField(pf, true);
                    }

                    if (username) {
                        usernames.push(username);
                    }
                }
            }
        }

        function findUsernameFieldWithoutForm(passwordField, canBeHidden) {
            var usernameField = null;
            for (var i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.elementNumber > passwordField.elementNumber) {
                    break;
                }

                if ((canBeHidden || f.viewable) && (f.type === 'text' || f.type === 'email' || f.type === 'tel')) {
                    usernameField = f;
                }
            }

            return usernameField;
        }

        if (passwordFields.length && !passwords.length) {
            // The page does not have any forms with password fields. Use the first password field on the page and the
            // input field just before it as the username.

            pf = passwordFields[0];
            passwords.push(pf);

            if (fillUsername && pf.elementNumber > 0) {
                username = findUsernameFieldWithoutForm(pf, false);

                if (!username) {
                    username = findUsernameFieldWithoutForm(pf, true);
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
};
