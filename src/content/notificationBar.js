!(function () {
    var pageDetails = [],
        formData = [];
    chrome.runtime.sendMessage({
        command: 'bgCollectPageDetails'
    });

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'openNotificationBar') {
            closeBar();
            openBar(msg.data.type, msg.data.typeData);
            sendResponse();
            return true;
        }
        else if (msg.command === 'closeNotificationBar') {
            closeBar();
            sendResponse();
            return true;
        }
        else if (msg.command === 'pageDetails') {
            console.log(msg.data);
            pageDetails.push(msg.data.details);
            watchForms(msg.data.forms);
            sendResponse();
            return true;
        }
    });

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

            if (form) {
                forms[i].formElement = form;
                formData.push(forms[i]);
                form.addEventListener('submit', formSubmitted, false);
            }
        }
    }

    function formSubmitted(e) {
        for (var i = 0; i < formData.length; i++) {
            if (formData[i].formElement === e.target) {
                var password = null,
                    username = null,
                    passwordId = formData[i].password ? formData[i].password.htmlID : null,
                    usernameId = formData[i].username ? formData[i].username.htmlID : null;

                if (passwordId && passwordId !== '') {
                    password = document.getElementById(passwordId);
                }
                else if (formData[i].password) {
                    password = document.getElementsByTagName('input')[formData[i].password.elementNumber];
                }

                if (usernameId && usernameId !== '') {
                    username = document.getElementById(usernameId);
                }
                else if (formData[i].username) {
                    username = document.getElementsByTagName('input')[formData[i].username.elementNumber];
                }

                var login = {
                    username: username.value,
                    password: password.value,
                    url: document.URL
                };

                if (login.password && login.password !== '') {
                    chrome.runtime.sendMessage({
                        command: 'bgAddLogin',
                        login: login
                    });
                    break;
                }
            }
        }
    }

    function openBar(type, typeData) {
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
            default:
                break;
        }

        var iframe = document.createElement('iframe');
        iframe.src = chrome.extension.getURL(barPage);
        iframe.style.cssText = 'height: 41px; width: 100%; border: 0;';

        var frameDiv = document.createElement('div');
        frameDiv.id = 'bit-notification-bar';
        frameDiv.style.cssText = 'height: 41px; width: 100%; top: 0; left: 0; padding: 0; position: fixed; z-index: 1000000099; visibility: visible;';
        frameDiv.appendChild(iframe);
        document.body.appendChild(frameDiv);

        var spacer = document.createElement('div');
        spacer.id = 'bit-notification-bar-spacer';
        spacer.style.cssText = 'height: 41px;';
        document.body.insertBefore(spacer, document.body.firstChild);
    }

    function closeBar() {
        var el = document.getElementById('bit-notification-bar');
        if (el) {
            el.parentElement.removeChild(el);
        }

        el = document.getElementById('bit-notification-bar-spacer');
        if (el) {
            el.parentElement.removeChild(el);
        }
    }
})();
