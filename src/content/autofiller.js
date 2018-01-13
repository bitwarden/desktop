document.addEventListener('DOMContentLoaded', (event) => {
    let pageHref = null;
    const enabledKey = 'enableAutoFillOnPageLoad';

    if ((typeof safari !== 'undefined')) {
        const responseCommand = 'autofillerAutofillOnPageLoadEnabledResponse';
        safari.self.tab.dispatchMessage('bitwarden', {
            command: 'bgGetDataForTab',
            responseCommand: responseCommand
        });
        safari.self.addEventListener('message', function (msgEvent) {
            const msg = msgEvent.message;
            if (msg.command === responseCommand && msg.data[enabledKey] === true) {
                setInterval(doFillIfNeeded, 500);
            }
        }, false);
        return;
    }
    else {
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
            }
            else {
                chrome.runtime.sendMessage(msg);
            }
        }
    }
});
