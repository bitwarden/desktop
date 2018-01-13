document.addEventListener('DOMContentLoaded', (event) => {
    let pageHref = null;
    const enabledKey = 'enableAutoFillOnPageLoad';

    if ((typeof safari !== 'undefined')) {
        const json = safari.extension.settings.getItem(enabledKey);
        if (json) {
            const obj = JSON.parse(json);
            if (obj && obj[enabledKey] === true) {
                setInterval(doFillIfNeeded, 500);
            }
        }
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
