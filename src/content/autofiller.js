document.addEventListener('DOMContentLoaded', (event) => {
    let pageHref = null;

    if ((typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1) {
        const responseCommand = 'autofillerAutofillOnPageLoadEnabledResponse';
        safari.self.tab.dispatchMessage('bitwarden', {
            command: 'bgGetDataForTab',
            responseCommand: responseCommand
        });
        safari.self.addEventListener('message', (msgEvent) => {
            const msg = msgEvent.message;
            if (msg.command === responseCommand && msg.data.autofillEnabled === true) {
                setInterval(doFillIfNeeded, 500);
            }
        }, false);
        return;
    } else {
        const enabledKey = 'enableAutoFillOnPageLoad';
        chrome.storage.local.get(enabledKey, (obj) => {
            if (obj && obj[enabledKey] === true) {
                setInterval(doFillIfNeeded, 500);
            }
        });
    }

    function doFillIfNeeded() {
        if (pageHref !== window.location.href) {
            pageHref = window.location.href;
            const msg = {
                command: 'bgCollectPageDetails',
                sender: 'autofiller'
            };

            if ((typeof safari !== 'undefined')) {
                safari.self.tab.dispatchMessage('bitwarden', msg);
            } else {
                chrome.runtime.sendMessage(msg);
            }
        }
    }
});
