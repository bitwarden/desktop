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
            f = null,
            username = null;

        for (var i = 0; i < pageDetails.fields.length; i++) {
            if (pageDetails.fields[i].type === 'password' && pageDetails.fields[i].viewable) {
                passwordFields.push(pageDetails.fields[i]);
            }
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

                if (fillUsername) {
                    for (var j = 0; j < pageDetails.fields.length; j++) {
                        f = pageDetails.fields[j];
                        if (f.form === pf.form && f.viewable && (f.type === 'text' || f.type === 'email' || f.type === 'tel')
                            && f.elementNumber < pf.elementNumber) {
                            username = f;
                        }
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
                username = null;
                for (i = 0; i < pageDetails.fields.length; i++) {
                    f = pageDetails.fields[i];
                    if (f.elementNumber > pf.elementNumber) {
                        break;
                    }

                    if (f.viewable && (f.type === 'text' || f.type === 'email' || f.type === 'tel')) {
                        username = f;
                    }
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
