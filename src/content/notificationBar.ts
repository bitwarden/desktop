document.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.hostname.indexOf('vault.bitwarden.com') > -1) {
        return;
    }

    const pageDetails: any[] = [];
    const formData: any[] = [];
    let barType: string = null;
    let pageHref: string = null;
    let observer: MutationObserver = null;
    const observeIgnoredElements = new Set(['a', 'i', 'b', 'strong', 'span', 'code', 'br', 'img', 'small', 'em', 'hr']);
    let domObservationCollectTimeout: number = null;
    let collectIfNeededTimeout: number = null;
    let observeDomTimeout: number = null;
    const inIframe = isInIframe();
    const submitButtonNames = new Set(['log in', 'sign in', 'login', 'go', 'submit', 'continue', 'next']);
    let notificationBarData = null;
    const isSafari = (typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1;

    if (isSafari) {
        if (inIframe) {
            return;
        }

        const responseCommand = 'notificationBarDataResponse';
        safari.self.tab.dispatchMessage('bitwarden', {
            command: 'bgGetDataForTab',
            responseCommand: responseCommand,
        });
        safari.self.addEventListener('message', (msgEvent: any) => {
            const msg = msgEvent.message;
            if (msg.command === responseCommand && msg.data) {
                notificationBarData = msg.data;
                if (notificationBarData.neverDomains &&
                    notificationBarData.neverDomains.hasOwnProperty(window.location.hostname)) {
                    return;
                }

                if (notificationBarData.disabledNotification === true) {
                    return;
                }

                collectIfNeededWithTimeout();
                return;
            }

            processMessages(msg, () => { /* do nothing on send response for Safari */ });
        }, false);
        return;
    } else {
        chrome.storage.local.get('neverDomains', (ndObj: any) => {
            const domains = ndObj.neverDomains;
            if (domains != null && domains.hasOwnProperty(window.location.hostname)) {
                return;
            }

            chrome.storage.local.get('disableAddLoginNotification', (disObj: any) => {
                if (disObj == null || !disObj.disableAddLoginNotification) {
                    collectIfNeededWithTimeout();
                }
            });
        });

        chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: Function) => {
            processMessages(msg, sendResponse);
        });
    }

    function processMessages(msg: any, sendResponse: Function) {
        if (msg.command === 'openNotificationBar') {
            if (inIframe) {
                return;
            }
            closeExistingAndOpenBar(msg.data.type, msg.data.typeData);
            sendResponse();
            return true;
        } else if (msg.command === 'closeNotificationBar') {
            if (inIframe) {
                return;
            }
            closeBar(true);
            sendResponse();
            return true;
        } else if (msg.command === 'adjustNotificationBar') {
            if (inIframe) {
                return;
            }
            adjustBar(msg.data);
            sendResponse();
            return true;
        } else if (msg.command === 'notificationBarPageDetails') {
            pageDetails.push(msg.data.details);
            watchForms(msg.data.forms);
            sendResponse();
            return true;
        }
    }

    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch {
            return true;
        }
    }

    function observeDom() {
        const bodies = document.querySelectorAll('body');
        if (bodies && bodies.length > 0) {
            observer = new MutationObserver((mutations) => {
                if (mutations == null || mutations.length === 0 || pageHref !== window.location.href) {
                    return;
                }

                let doCollect = false;
                for (let i = 0; i < mutations.length; i++) {
                    const mutation = mutations[i];
                    if (mutation.addedNodes == null || mutation.addedNodes.length === 0) {
                        continue;
                    }

                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const addedNode: any = mutation.addedNodes[j];
                        if (addedNode == null) {
                            continue;
                        }

                        const tagName = addedNode.tagName != null ? addedNode.tagName.toLowerCase() : null;
                        if (tagName != null && tagName === 'form' &&
                            (addedNode.dataset == null || !addedNode.dataset.bitwardenWatching)) {
                            doCollect = true;
                            break;
                        }

                        if ((tagName != null && observeIgnoredElements.has(tagName)) ||
                            addedNode.querySelectorAll == null) {
                            continue;
                        }

                        const forms = addedNode.querySelectorAll('form:not([data-bitwarden-watching])');
                        if (forms != null && forms.length > 0) {
                            doCollect = true;
                            break;
                        }
                    }

                    if (doCollect) {
                        break;
                    }
                }

                if (doCollect) {
                    if (domObservationCollectTimeout != null) {
                        window.clearTimeout(domObservationCollectTimeout);
                    }

                    domObservationCollectTimeout = window.setTimeout(collect, 1000);
                }
            });

            observer.observe(bodies[0], { childList: true, subtree: true });
        }
    }

    function collectIfNeededWithTimeout() {
        if (collectIfNeededTimeout != null) {
            window.clearTimeout(collectIfNeededTimeout);
        }
        collectIfNeededTimeout = window.setTimeout(collectIfNeeded, 1000);
    }

    function collectIfNeeded() {
        if (pageHref !== window.location.href) {
            pageHref = window.location.href;
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            collect();

            if (observeDomTimeout != null) {
                window.clearTimeout(observeDomTimeout);
            }
            observeDomTimeout = window.setTimeout(observeDom, 1000);
        }

        if (collectIfNeededTimeout != null) {
            window.clearTimeout(collectIfNeededTimeout);
        }
        collectIfNeededTimeout = window.setTimeout(collectIfNeeded, 1000);
    }

    function collect() {
        sendPlatformMessage({
            command: 'bgCollectPageDetails',
            sender: 'notificationBar',
        });
    }

    function watchForms(forms: any[]) {
        if (forms == null || forms.length === 0) {
            return;
        }

        forms.forEach((f: any) => {
            const formId: string = f.form != null ? f.form.htmlID : null;
            let formEl: HTMLElement = null;
            if (formId != null && formId !== '') {
                formEl = document.getElementById(formId);
            }

            if (formEl == null) {
                const index = parseInt(f.form.opid.split('__')[2], null);
                formEl = document.getElementsByTagName('form')[index];
            }

            if (formEl != null && formEl.dataset.bitwardenWatching !== '1') {
                const formDataObj: any = {
                    data: f,
                    formEl: formEl,
                    usernameEl: null,
                    passwordEl: null,
                    passwordEls: null,
                };
                locateFields(formDataObj);
                formData.push(formDataObj);
                listen(formEl);
                formEl.dataset.bitwardenWatching = '1';
            }
        });
    }

    function listen(form: HTMLElement) {
        form.removeEventListener('submit', formSubmitted, false);
        form.addEventListener('submit', formSubmitted, false);
        const submitButton = form.querySelector('input[type="submit"], input[type="image"], ' +
            'button[type="submit"], button:not([type])');
        if (submitButton != null) {
            submitButton.removeEventListener('click', formSubmitted, false);
            submitButton.addEventListener('click', formSubmitted, false);
        } else {
            const possibleSubmitButtons = Array.from(form.querySelectorAll('a, span, button[type="button"], ' +
                'input[type="button"]')) as HTMLElement[];
            possibleSubmitButtons.forEach((button) => {
                if (button == null || button.tagName == null) {
                    return;
                }

                let buttonText: string = null;
                if (button.tagName.toLowerCase() === 'input') {
                    buttonText = (button as HTMLInputElement).value;
                } else {
                    buttonText = button.innerText;
                }

                if (buttonText == null) {
                    return;
                }

                buttonText = buttonText.trim().toLowerCase();
                if (submitButtonNames.has(buttonText)) {
                    button.removeEventListener('click', formSubmitted, false);
                    button.addEventListener('click', formSubmitted, false);
                }
            });
        }
    }

    function locateFields(formDataObj: any) {
        const inputs = Array.from(document.getElementsByTagName('input'));
        formDataObj.usernameEl = locateField(formDataObj.formEl, formDataObj.data.username, inputs);
        if (formDataObj.usernameEl != null && formDataObj.data.password != null) {
            formDataObj.passwordEl = locatePassword(formDataObj.formEl, formDataObj.data.password, inputs, true);
        } else if (formDataObj.data.passwords != null && formDataObj.data.passwords.length === 3) {
            formDataObj.passwordEls = [];
            formDataObj.data.passwords.forEach((pData: any) => {
                const el = locatePassword(formDataObj.formEl, pData, inputs, false);
                if (el != null) {
                    formDataObj.passwordEls.push(el);
                }
            });
            if (formDataObj.passwordEls.length !== 3) {
                formDataObj.passwordEls = null;
            }
        }
    }

    function locatePassword(form: HTMLFormElement, passwordData: any, inputs: HTMLInputElement[],
        doLastFallback: boolean) {
        let el = locateField(form, passwordData, inputs);
        if (el != null && el.type !== 'password') {
            el = null;
        }
        if (doLastFallback && el == null) {
            el = form.querySelector('input[type="password"]');
        }
        return el;
    }

    function locateField(form: HTMLFormElement, fieldData: any, inputs: HTMLInputElement[]) {
        if (fieldData == null) {
            return;
        }
        let el: HTMLInputElement = null;
        if (fieldData.htmlID != null && fieldData.htmlID !== '') {
            try {
                el = form.querySelector('#' + fieldData.htmlID);
            } catch { }
        }
        if (el == null && fieldData.htmlName != null && fieldData.htmlName !== '') {
            el = form.querySelector('input[name="' + fieldData.htmlName + '"]');
        }
        if (el == null && fieldData.elementNumber != null) {
            el = inputs[fieldData.elementNumber];
        }
        return el;
    }

    function formSubmitted(e: Event) {
        let form: HTMLFormElement = null;
        if (e.type === 'click') {
            form = (e.target as HTMLElement).closest('form');
        } else {
            form = e.target as HTMLFormElement;
        }

        if (form == null || form.dataset.bitwardenProcessed === '1') {
            return;
        }

        for (let i = 0; i < formData.length; i++) {
            if (formData[i].formEl !== form) {
                continue;
            }
            if (formData[i].usernameEl != null && formData[i].passwordEl != null) {
                const login = {
                    username: formData[i].usernameEl.value,
                    password: formData[i].passwordEl.value,
                    url: document.URL,
                };

                if (login.username != null && login.username !== '' &&
                    login.password != null && login.password !== '') {
                    processedForm(form);
                    sendPlatformMessage({
                        command: 'bgAddLogin',
                        login: login,
                    });
                    break;
                }
            }
            if (formData[i].passwordEls != null && formData[i].passwordEls.length === 3) {
                const passwords = formData[i].passwordEls
                    .filter((el: HTMLInputElement) => el.value != null && el.value !== '')
                    .map((el: HTMLInputElement) => el.value);
                if (passwords.length === 3) {
                    const newPass: string = passwords[1];
                    let curPass: string = null;
                    if (passwords[0] !== newPass && newPass === passwords[2]) {
                        curPass = passwords[0];
                    } else if (newPass !== passwords[2] && passwords[0] === newPass) {
                        curPass = passwords[2];
                    }
                    if (newPass != null && curPass != null) {
                        processedForm(form);
                        sendPlatformMessage({
                            command: 'bgChangedPassword',
                            data: {
                                newPassword: newPass,
                                currentPassword: curPass,
                                url: document.URL,
                            },
                        });
                        break;
                    }
                }
            }
        }
    }

    function processedForm(form: HTMLFormElement) {
        form.dataset.bitwardenProcessed = '1';
        window.setTimeout(() => {
            form.dataset.bitwardenProcessed = '0';
        }, 500);
    }

    function closeExistingAndOpenBar(type: string, typeData: any) {
        let barPage = 'notification/bar.html';
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
            case 'change':
                barPage = barPage + '?change=1';
                break;
            default:
                break;
        }

        const frame = document.getElementById('bit-notification-bar-iframe') as HTMLIFrameElement;
        if (frame != null && frame.src.indexOf(barPage) >= 0) {
            return;
        }

        closeBar(false);
        openBar(type, barPage);
    }

    function openBar(type: string, barPage: string) {
        barType = type;

        if (document.body == null) {
            return;
        }

        const barPageUrl: string = isSafari ? (safari.extension.baseURI + barPage) : chrome.extension.getURL(barPage);

        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'height: 42px; width: 100%; border: 0; min-height: initial;';
        iframe.id = 'bit-notification-bar-iframe';

        const frameDiv = document.createElement('div');
        frameDiv.id = 'bit-notification-bar';
        frameDiv.style.cssText = 'height: 42px; width: 100%; top: 0; left: 0; padding: 0; position: fixed; ' +
            'z-index: 2147483647; visibility: visible;';
        frameDiv.appendChild(iframe);
        document.body.appendChild(frameDiv);

        (iframe.contentWindow.location as any) = barPageUrl;

        const spacer = document.createElement('div');
        spacer.id = 'bit-notification-bar-spacer';
        spacer.style.cssText = 'height: 42px;';
        document.body.insertBefore(spacer, document.body.firstChild);
    }

    function closeBar(explicitClose: boolean) {
        const barEl = document.getElementById('bit-notification-bar');
        if (barEl != null) {
            barEl.parentElement.removeChild(barEl);
        }

        const spacerEl = document.getElementById('bit-notification-bar-spacer');
        if (spacerEl) {
            spacerEl.parentElement.removeChild(spacerEl);
        }

        if (!explicitClose) {
            return;
        }

        switch (barType) {
            case 'add':
                sendPlatformMessage({
                    command: 'bgAddClose',
                });
                break;
            case 'change':
                sendPlatformMessage({
                    command: 'bgChangeClose',
                });
                break;
            default:
                break;
        }
    }

    function adjustBar(data: any) {
        if (data != null && data.height !== 42) {
            const newHeight = data.height + 'px';
            doHeightAdjustment('bit-notification-bar-iframe', newHeight);
            doHeightAdjustment('bit-notification-bar', newHeight);
            doHeightAdjustment('bit-notification-bar-spacer', newHeight);
        }
    }

    function doHeightAdjustment(elId: string, heightStyle: string) {
        const el = document.getElementById(elId);
        if (el != null) {
            el.style.height = heightStyle;
        }
    }

    function sendPlatformMessage(msg: any) {
        if (isSafari) {
            safari.self.tab.dispatchMessage('bitwarden', msg);
        } else {
            chrome.runtime.sendMessage(msg);
        }
    }
});
