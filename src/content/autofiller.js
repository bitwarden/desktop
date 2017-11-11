document.addEventListener('DOMContentLoaded', (event) => {
    let pageHref = null;

    chrome.storage.local.get('enableAutoFillOnPageLoad', (obj) => {
        if (obj && obj.enableAutoFillOnPageLoad === true) {
            setInterval(doFillIfNeeded, 500);
        }
    });

    function doFillIfNeeded() {
        if (pageHref !== window.location.href) {
            pageHref = window.location.href;
            chrome.runtime.sendMessage({
                command: 'bgCollectPageDetails',
                sender: 'autofiller'
            });
        }
    }
});
