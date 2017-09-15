document.addEventListener('DOMContentLoaded', function (event) {
    var pageDetails = [],
        formData = [],
        barType = null;

    setTimeout(collect, 1000);
    window.addEventListener('popstate', collect);

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'openNotificationBar') {
            closeExistingAndOpenBar(msg.data.type, msg.data.typeData);
            sendResponse();
            return true;
        }
        else if (msg.command === 'closeNotificationBar') {
            closeBar(true);
            sendResponse();
            return true;
        }
        else if (msg.command === 'adjustNotificationBar') {
            adjustBar(msg.data);
            sendResponse();
            return true;
        }
        else if (msg.command === 'pageDetails') {
            pageDetails.push(msg.data.details);
            watchForms(msg.data.forms);
            sendResponse();
            return true;
        }
    });

    function collect() {
        if (window.location.hostname.indexOf('bitwarden.com') === -1) {
            chrome.storage.local.get('neverDomains', function (obj) {
                var domains = obj.neverDomains;
                if (domains && domains.hasOwnProperty(window.location.hostname)) {
                    return;
                }

                chrome.storage.local.get('disableAddLoginNotification', function (obj) {
                    if (!obj || !obj.disableAddLoginNotification) {
                        chrome.runtime.sendMessage({
                            command: 'bgCollectPageDetails',
                            sender: 'notificationBar'
                        });
                    }
                });
            });
        }
    }

    function watchForms(forms) {
        if (!forms || !forms.length) {
            return;
        }

        for (var i = 0; i < forms.length; i++) {
            var form = null,
                formId = forms[i].form ? forms[i].form.htmlID : null;

            if (formId && formId !== '') {
                form = document.getElementById(formId);
            }

            if (!form) {
                var index = parseInt(forms[i].form.opid.split('__')[2]);
                form = document.getElementsByTagName('form')[index];
            }

            if (form && form.dataset.bitwardenWatching !== '1') {
                var formDataObj = {
                    data: forms[i],
                    formEl: form,
                    usernameEl: null,
                    passwordEl: null
                };
                locateFields(formDataObj);
                formData.push(formDataObj);
                listen(form);
                form.dataset.bitwardenWatching = '1';
            }
        }
    }

    function listen(form) {
        form.removeEventListener('submit', formSubmitted, false);
        form.addEventListener('submit', formSubmitted, false);
        var submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
        if (submitButton) {
            submitButton.removeEventListener('click', formSubmitted, false);
            submitButton.addEventListener('click', formSubmitted, false);
        }
    }

    function locateFields(formDataObj) {
        var passwordId = formDataObj.data.password ? formDataObj.data.password.htmlID : null,
            usernameId = formDataObj.data.username ? formDataObj.data.username.htmlID : null,
            passwordName = formDataObj.data.password ? formDataObj.data.password.htmlName : null,
            usernameName = formDataObj.data.username ? formDataObj.data.username.htmlName : null,
            inputs = document.getElementsByTagName('input');

        if (passwordId && passwordId !== '') {
            try {
                formDataObj.passwordEl = formDataObj.formEl.querySelector('#' + passwordId);
            }
            catch (e) { }
        }
        if (!formDataObj.passwordEl && passwordName !== '') {
            formDataObj.passwordEl = formDataObj.formEl.querySelector('input[name="' + passwordName + '"]');
        }
        if (!formDataObj.passwordEl && formDataObj.passwordEl) {
            formDataObj.passwordEl = inputs[formDataObj.data.password.elementNumber];
            if (formDataObj.passwordEl && formDataObj.passwordEl.type !== 'password') {
                formDataObj.passwordEl = null;
            }
        }
        if (!formDataObj.passwordEl) {
            formDataObj.passwordEl = formDataObj.formEl.querySelector('input[type="password"]');
        }

        if (usernameId && usernameId !== '') {
            try {
                formDataObj.usernameEl = formDataObj.formEl.querySelector('#' + usernameId);
            }
            catch (e) { }
        }
        if (!formDataObj.usernameEl && usernameName !== '') {
            formDataObj.usernameEl = formDataObj.formEl.querySelector('input[name="' + usernameName + '"]');
        }
        if (!formDataObj.usernameEl && formDataObj.data.username) {
            formDataObj.usernameEl = inputs[formDataObj.data.username.elementNumber];
        }
    }

    function formSubmitted(e) {
        var form = null;
        if (e.type === 'click') {
            form = e.target.closest('form');
        }
        else {
            form = e.target;
        }

        if (!form || form.dataset.bitwardenProcessed === '1') {
            return;
        }

        for (var i = 0; i < formData.length; i++) {
            if (formData[i].formEl === form) {
                if (!formData[i].usernameEl || !formData[i].passwordEl) {
                    break;
                }

                var login = {
                    username: formData[i].usernameEl.value,
                    password: formData[i].passwordEl.value,
                    url: document.URL
                };

                if (login.username && login.username !== '' && login.password && login.password !== '') {
                    form.dataset.bitwardenProcessed = '1';
                    setTimeout(function () {
                        form.dataset.bitwardenProcessed = '0';
                    }, 500);

                    chrome.runtime.sendMessage({
                        command: 'bgAddLogin',
                        login: login
                    });
                    break;
                }
            }
        }
    }

    function closeExistingAndOpenBar(type, typeData) {
        var barPage = 'notification/bar.html';
        switch (type) {
            case 'info':
                barPage = barPage + '?info=' + typeData.text;
                break;
            case 'warning':
                barPage = barPage + '?warning=' + typeData.text;
                break;
            case 'error':
                barPage = barPage + '?error=' + typeData.text;
                break;
            case 'success':
                barPage = barPage + '?success=' + typeData.text;
                break;
            case 'add':
                barPage = barPage + '?add=1';
                break;
            default:
                break;
        }

        var frame = document.getElementById('bit-notification-bar-iframe');
        if (frame && frame.src.indexOf(barPage) >= 0) {
            return;
        }

        closeBar(false);
        openBar(type, barPage);
    }

    function openBar(type, barPage) {
        barType = type;

        if (!document.body) {
            return;
        }

        var iframe = document.createElement('iframe');
        iframe.src = chrome.extension.getURL(barPage);
        iframe.style.cssText = 'height: 42px; width: 100%; border: 0;';
        iframe.id = 'bit-notification-bar-iframe';

        var frameDiv = document.createElement('div');
        frameDiv.id = 'bit-notification-bar';
        frameDiv.style.cssText = 'height: 42px; width: 100%; top: 0; left: 0; padding: 0; position: fixed; z-index: 2147483647; visibility: visible;';
        frameDiv.appendChild(iframe);
        document.body.appendChild(frameDiv);

        var spacer = document.createElement('div');
        spacer.id = 'bit-notification-bar-spacer';
        spacer.style.cssText = 'height: 42px;';
        document.body.insertBefore(spacer, document.body.firstChild);
    }

    function closeBar(explicitClose) {
        var el = document.getElementById('bit-notification-bar');
        if (el) {
            el.parentElement.removeChild(el);
        }

        el = document.getElementById('bit-notification-bar-spacer');
        if (el) {
            el.parentElement.removeChild(el);
        }

        if (!explicitClose) {
            return;
        }

        switch (barType) {
            case 'add':
                chrome.runtime.sendMessage({
                    command: 'bgAddClose'
                });
                break;
            default:
                break;
        }
    }

    function adjustBar(data) {
        if (data.height !== 42) {
            var newHeight = data.height + 'px';
            doHeightAdjustment('bit-notification-bar-iframe', newHeight);
            doHeightAdjustment('bit-notification-bar', newHeight);
            doHeightAdjustment('bit-notification-bar-spacer', newHeight);
        }
    }

    function doHeightAdjustment(elId, heightStyle) {
        var el = document.getElementById(elId);
        if (el) {
            el.style.height = heightStyle;
        }
    }
});
