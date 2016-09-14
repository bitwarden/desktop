angular
    .module('bit.current')

    .controller('currentController', function ($scope, siteService, cipherService, tldjs, toastr, $q) {
        var pageDetails = null,
            tabId = null;
        $scope.canAutofill = false;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var url = null;
            if (tabs.length > 0) {
                url = tabs[0].url;
                tabId = tabs[0].id;
            }
            else {
                return;
            }

            var domain = tldjs.getDomain(url);
            $scope.sites = [];
            if (!domain) {
                return;
            }

            chrome.tabs.sendMessage(tabId, { command: 'collectPageDetails' }, function (details) {
                pageDetails = details;
                $scope.canAutofill = true;
            });

            var filteredPromises = [],
                filteredSites = [],
                promises = [],
                decSites = [];

            siteService.getAll(function (sites) {
                for (var i = 0; i < sites.length; i++) {
                    var uriPromise = cipherService.decrypt(sites[i].uri, i);
                    filteredPromises.push(uriPromise);
                    uriPromise.then(function (obj) {
                        if (!obj.val) {
                            return;
                        }

                        var siteDomain = tldjs.getDomain(obj.val);
                        if (!siteDomain || siteDomain != domain) {
                            return;
                        }

                        filteredSites.push(obj.index);
                    });
                }

                $q.all(filteredPromises).then(function () {
                    for (var j = 0; j < filteredSites.length; j++) {
                        var index = filteredSites[j];
                        decSites.push({
                            id: sites[index].id,
                            folderId: sites[index].folderId,
                            favorite: sites[index].favorite
                        });

                        var namePromise = cipherService.decrypt(sites[index].name, j);
                        promises.push(namePromise);
                        namePromise.then(function (obj) {
                            decSites[obj.index].name = obj.val;
                        });

                        var usernamePromise = cipherService.decrypt(sites[index].username, j);
                        promises.push(usernamePromise);
                        usernamePromise.then(function (obj) {
                            decSites[obj.index].username = obj.val;
                        });

                        var passwordPromise = cipherService.decrypt(sites[index].password, j);
                        promises.push(passwordPromise);
                        passwordPromise.then(function (obj) {
                            decSites[obj.index].password = obj.val;
                        });
                    }

                    $q.all(promises).then(function () {
                        $scope.sites = decSites;
                    });
                });
            });
        });

        $scope.fillSite = function (site) {
            var fillScript = null;
            if (site && $scope.canAutofill && pageDetails) {
                fillScript = makeFillScript(site.username, site.password);
            }

            if (tabId && fillScript) {
                chrome.tabs.sendMessage(tabId, {
                    command: 'fillForm',
                    fillScript: fillScript
                }, function () { });
            }
        };

        function makeFillScript(fillUsername, fillPassword) {
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

            var passwordFields = [];
            for (var i = 0; i < pageDetails.fields.length; i++) {
                if (pageDetails.fields[i].type == 'password') {
                    passwordFields.push(pageDetails.fields[i]);
                }
            }

            var passwordForms = [];
            for (var formKey in pageDetails.forms) {
                for (var j = 0; j < passwordFields.length; j++) {
                    if (formKey == passwordFields[j].form) {
                        passwordForms.push(pageDetails.forms[formKey]);
                        break;
                    }
                }
            }

            if (!passwordForms.length) {
                return null;
            }

            var loginForm = null;
            if (passwordForms.length > 1) {
                // More than one form with a password field is on the page.
                // This usually occurs when a website has a login and signup form on the same page.
                // Let's try to guess which one is the login form.

                // First let's try to guess the correct login form by examining the form attribute strings
                // for common login form attribute.
                for (i = 0; i < passwordForms.length; i++) {
                    var formDescriptor = (passwordForms[i].htmlName + '~' + passwordForms[i].htmlId
                        + '~' + passwordForms[i].htmlAction).toLowerCase();

                    if (formDescriptor.indexOf('login') !== -1 || formDescriptor.indexOf('log-in') !== -1
                         || formDescriptor.indexOf('signin') !== -1 || formDescriptor.indexOf('sign-in') !== -1
                         || formDescriptor.indexOf('logon') !== -1 || formDescriptor.indexOf('log-on') !== -1) {
                        loginForm = passwordForms[i];
                        break;
                    }
                }

                if (!loginForm) {
                    // Next we can try to find the login form that only has one password field. Typically
                    // a registration form may have two password fields for password confirmation.
                    for (i = 0; i < passwordForms.length; i++) {
                        var passwordFieldCount = 0;

                        for (var j = 0; j < passwordFields.length; j++) {
                            if (passwordForms[i].opid == passwordFields[j].form) {
                                passwordFieldCount++;
                            }
                        }

                        if (passwordFieldCount === 1) {
                            loginForm = passwordForms[i];
                            break;
                        }
                    }
                }
            }

            if (!loginForm) {
                loginForm = passwordForms[0];
            }

            var password = null;
            for (i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.form == loginForm.opid && f.type == 'password') {
                    password = f;
                    break;
                }
            }

            var username = null;
            for (i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.form == loginForm.opid && (f.type == 'text' || f.type == 'email')
                    && f.elementNumber < password.elementNumber) {
                    username = f;
                }
            }

            if (username) {
                fillScript.script.push(['click_on_opid', username.opid]);
                fillScript.script.push(['fill_by_opid', username.opid, fillUsername]);
            }

            fillScript.script.push(['click_on_opid', password.opid]);
            fillScript.script.push(['fill_by_opid', password.opid, fillPassword]);

            if (loginForm.htmlAction) {
                fillScript.autosubmit = { focusOpid: password.opid };
            }

            return fillScript;
        }
    });
